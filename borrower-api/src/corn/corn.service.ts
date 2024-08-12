import {  Injectable,InternalServerErrorException,Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { config } from 'dotenv';
import { getManager } from 'typeorm';

import { TransactionEntity,method,payment } from 'src/entities/transaction.entity';
import {LogEntity} from '../entities/log.entity';
import { Notification } from 'src/entities/notification.entity';
import { StatusFlags } from 'src/entities/paymentschedule.entity';

import { PaymentScheduleRepository } from 'src/repository/paymentSchedule.repository';
import { LogRepository } from '../repository/log.repository';
import { TransactionRepository } from 'src/repository/transaction.repository';
import { NotificationRepository } from 'src/repository/notification.repository';
import { MailService } from 'src/mail/mail.service';
import {HttpService} from '@nestjs/axios';

config();

@Injectable()
export class CornService {
    paymentlist:any = [];
    private readonly logger = new Logger(CornService.name);
    constructor(
        @InjectRepository(TransactionRepository) private readonly transactionRepository:TransactionRepository,
        @InjectRepository(NotificationRepository) private readonly notificationRepository: NotificationRepository,
        @InjectRepository(PaymentScheduleRepository) private readonly paymentScheduleRepository: PaymentScheduleRepository,
        @InjectRepository(LogRepository) private readonly logRepository: LogRepository,
        private readonly mailService: MailService,
        private httpService: HttpService      

        ){}
    
    @Cron('*/1 * * * *')
    async handleCron() {
        const entityManager = getManager();
        let url:any = process.env.loanpaymenprourl_v2
        try{
            if(this.paymentlist.length==0){
                this.logger.debug('check autopayment list');
                this.paymentlist = await entityManager.query(`
            select t3.id as id1, t.id as id, t4.active_flag as bank_active, t4.loanpayment_paymentmethodtoken as bank_paymenttoken, t5.active_flag as card_active, t5.loanpayment_paymentmethodtoken as card_paymenttoken from loan t 
            join customer t2 on t2.loan_id = t.id
            join paymentschedule t3 on t3.loan_id = t.id
            join userbankaccount t4 on t4.user_id = t.user_id 
            join userdebitcard t5 on t5.user_id = t.user_id 
            where t.delete_flag = 'N'
            and t.active_flag = 'Y'
            and t.status_flag = 'approved'
            and t2."autopayment" = 'Y'
            and t3.status_flag = 'UNPAID'
            and (t4.active_flag = 'Y' or t5.active_flag='Y')
            and to_char(t3."scheduledate"::DATE, 'yyyy-mm-dd') <= (SELECT TO_CHAR(NOW() :: DATE, 'yyyy-mm-dd'))
            order by t3."scheduledate" asc `)
            }
            if(this.paymentlist.length>0){
                this.logger.debug(JSON.stringify(this.paymentlist));
                if(this.paymentlist[0]['card_active'] == 'Y' && this.paymentlist[0]['card_paymenttoken']!=null){
                    this.logger.debug('Card Payment');
                    
                    let payamentid=this.paymentlist[0]['card_paymenttoken']
                    let loanid=this.paymentlist[0]['id']
                    let paymentlist = await entityManager.query(`select id,amount from paymentschedule where loan_id = '${loanid}' and status_flag = 'UNPAID' order by "scheduledate" asc limit 1`)
            let timezone = await entityManager.query(`select current_timestamp`)
            let account = await entityManager.query(`select t.id as id, t2.email as email, t.user_id as user_id from userdebitcard t join user t2 on t2.id = t.user_id where t.loanpayment_paymentmethodtoken = '${payamentid}'`)
            let email = account[0]['email'] 
            let user_id = account[0]['user_id'] 
            let accountid = account[0]['id']
            timezone = timezone[0]['current_timestamp']
            if(paymentlist.length>0){
                let data = {
                    Amount:paymentlist[0].amount.toString()
                }
                let config = {
                    headers: {
                        "TransactionKey": process.env.BankCardAcquiring_Transaction_Key,
                        "Content-type": "application/json"
                    }
                }
                let res = await this.httpService.post(url+"payments/paymentcards/"+payamentid+"/run",data,config).toPromise()
                res = res.data
                let Transaction = new TransactionEntity()
                Transaction.authcode = res['authcode']
                Transaction.message = res['message']
                Transaction.status = res['Status']
                Transaction.transactionid = res['transactionid']
                Transaction.account_id = accountid
                Transaction.accountmethod = method.card
                Transaction.amount = paymentlist[0].amount.toString()
                Transaction.payment = payment.Loan
                Transaction.loan_id = loanid
                await this.transactionRepository.save(Transaction)
                let log = new LogEntity();
                log.module = "Auto Payment LoanPayment - TransactionId: "+res['transactionid']+", Amount:" +paymentlist[0].amount.toString()+", Status: "+res['Status'];
                log.user_id = user_id;
                log.loan_id = loanid;
                await this.logRepository.save(log)
                this.savenotification("Payment Request","transactionid: "+res['transactionid']+", Amount:" +paymentlist[0].amount.toString())
                this.mailService.payment(email,paymentlist[0].amount.toString(),res['Status'],res['transactionid'])
                this.paymentScheduleRepository.update({id: paymentlist[0]['id']},{status_flag:StatusFlags.PAID,paidat:timezone,transactionid:res['transactionid']})
                   
                this.logger.debug(JSON.stringify({"statusCode": 200, status:res['Status'],transactionid:res['transactionid'],amount:paymentlist[0].amount.toString()}));
            }
                
                }else{
                    this.logger.debug('Bank Payment');
                }
                this.paymentlist.shift(1)
            }            
        }catch(error){
            this.logger.error(JSON.stringify(error))
        }
    }



    async cardpayment(payamentid,loanid){
        const entityManager = getManager();
        let url:any = process.env.loanpaymenprourl_v2
        try{
            let paymentlist = await entityManager.query(`select id,amount from paymentschedule where loan_id = '${loanid}' and status_flag = 'UNPAID' order by "scheduledate" asc limit 1`)
            let timezone = await entityManager.query(`select current_timestamp`)
            let account = await entityManager.query(`select t.id as id, t2.email as email, t.user_id as user_id from userdebitcard t join user t2 on t2.id = t.user_id where t.loanpayment_paymentmethodtoken = '${payamentid}'`)
            let email = account[0]['email'] 
            let user_id = account[0]['user_id'] 
            let accountid = account[0]['id']
            timezone = timezone[0]['current_timestamp']
            if(paymentlist.length>0){
                let data = {
                    Amount:paymentlist[0].amount.toString()
                }
                let config = {
                    headers: {
                        "TransactionKey": process.env.BankCardAcquiring_Transaction_Key,
                        "Content-type": "application/json"
                    }
                }
                let res = await this.httpService.post(url+"payments/paymentcards/"+payamentid+"/run",data,config).toPromise()
                res = res.data
                let Transaction = new TransactionEntity()
                Transaction.authcode = res['authcode']
                Transaction.message = res['message']
                Transaction.status = res['Status']
                Transaction.transactionid = res['transactionid']
                Transaction.account_id = accountid
                Transaction.accountmethod = method.card
                Transaction.amount = paymentlist[0].amount.toString()
                Transaction.payment = payment.Loan
                Transaction.loan_id = loanid
                await this.transactionRepository.save(Transaction)
                let log = new LogEntity();
                log.module = "Auto Payment LoanPayment - TransactionId: "+res['transactionid']+", Amount:" +paymentlist[0].amount.toString()+", Status: "+res['Status'];
                log.user_id = user_id;
                log.loan_id = loanid;
                await this.logRepository.save(log)
                this.savenotification("Payment Request","transactionid: "+res['transactionid']+", Amount:" +paymentlist[0].amount.toString())
                this.mailService.payment(email,paymentlist[0].amount.toString(),res['Status'],res['transactionid'])
                this.paymentScheduleRepository.update({id: paymentlist[0]['id']},{status_flag:StatusFlags.PAID,paidat:timezone,transactionid:res['transactionid']})

                return {"statusCode": 200, status:res['Status'],transactionid:res['transactionid'],amount:paymentlist[0].amount.toString()};
            }else{
                return {"statusCode": 200 };
            }
                        
        }catch(error){
            return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
        }
    }

    async savenotification(title,msg){
        console.log('notification')
        let noti = new Notification()
        noti.title = title;
        noti.message = msg;
        await this.notificationRepository.save(noti)
    }
}
