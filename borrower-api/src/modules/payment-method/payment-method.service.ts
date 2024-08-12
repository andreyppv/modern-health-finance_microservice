import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserBankAccount, Flags } from 'src/entities/userBankAccount.entity';
import { UserDebitCard } from 'src/entities/userDebitCard.entity';
import { CustomerRepository } from 'src/repository/customer.repository';
import { UserBankAccountRepository } from 'src/repository/userBankAccounts.repository';
import { UserDebitCardRepository } from 'src/repository/userDebitCard.repository';
import { getManager } from 'typeorm';
import { bankAddDto } from './dto/bankAdd.dto';
import { debitCardAddDto } from './dto/debitCardAdd.dto';
import { config } from 'dotenv';
import { HttpService } from '@nestjs/axios';
import { TransactionRepository } from 'src/repository/transaction.repository';
import {
  TransactionEntity,
  method,
  payment,
} from 'src/entities/transaction.entity';
import { NotificationRepository } from 'src/repository/notification.repository';
import { Notification } from 'src/entities/notification.entity';
import { MailService } from 'src/mail/mail.service';
import { StatusFlags } from 'src/entities/paymentschedule.entity';
import { PaymentScheduleRepository } from 'src/repository/paymentSchedule.repository';
import { LogRepository } from '../../repository/log.repository';
import { LogEntity } from '../../entities/log.entity';
config();

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(UserDebitCardRepository)
    private readonly userDebitCardRepository: UserDebitCardRepository,
    @InjectRepository(UserBankAccountRepository)
    private readonly userBankAccountRepository: UserBankAccountRepository,
    @InjectRepository(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
    @InjectRepository(TransactionRepository)
    private readonly transactionRepository: TransactionRepository,
    @InjectRepository(NotificationRepository)
    private readonly notificationRepository: NotificationRepository,
    @InjectRepository(PaymentScheduleRepository)
    private readonly paymentScheduleRepository: PaymentScheduleRepository,
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
    private readonly mailService: MailService,
    private httpService: HttpService,
  ) {}

  //Debit card api

  async debitCardAdd(debitCardAddDto: debitCardAddDto) {
    const entityManager = getManager();
    let url: any = process.env.loanpaymenprourl_v2;
    let loanpayment_customertoken = '';
    const users = await entityManager.query(
      `select "loanpayment_customertoken", "firstname", "lastname" from customer where user_id = '${debitCardAddDto.user_id}'`,
    );

    if (users.length > 0) {
      if (!users[0].loanpayment_customertoken) {
        let data = {
          FirstName: users[0].firstname,
          LastName: users[0].lastname,
        };
        let config = {
          headers: {
            TransactionKey: process.env.BankCardAcquiring_Transaction_Key,
            'Content-type': 'application/json',
          },
        };
        let res = await this.httpService
          .post(url + 'customers/add', data, config)
          .toPromise();
        res = res.data;
        if (res['Status'] == 'Success') {
          loanpayment_customertoken = res['CustomerToken'];
          this.customerRepository.update(
            { user_id: debitCardAddDto.user_id },
            { loanpayment_customertoken: loanpayment_customertoken },
          );
        } else {
          return {
            statusCode: 500,
            message: ["Can't add Card Details Please Contant Admin"],
          };
        }
      } else {
        loanpayment_customertoken = users[0].loanpayment_customertoken;
      }
    }
    if (loanpayment_customertoken.length > 0) {
      let data = {
        CardCode: debitCardAddDto.csc,
        CardNumber: debitCardAddDto.cardnumber,
        ExpMonth: debitCardAddDto.expires.split('/')[0],
        ExpYear: debitCardAddDto.expires.split('/')[1],
      };
      let config = {
        headers: {
          TransactionKey: process.env.BankCardAcquiring_Transaction_Key,
          'Content-type': 'application/json',
        },
      };
      let res = await this.httpService
        .post(
          url + 'customers/' + loanpayment_customertoken + '/paymentcards/add',
          data,
          config,
        )
        .toPromise();
      res = res.data;
      if (res['Status'] == 'Success') {
        try {
          let userDebitCard = new UserDebitCard();
          userDebitCard.loanpayment_paymentmethodtoken =
            res['PaymentMethodToken'];
          userDebitCard.fullname = debitCardAddDto.fullname;
          userDebitCard.cardnumber = debitCardAddDto.cardnumber;
          userDebitCard.expires = debitCardAddDto.expires;
          userDebitCard.csc = debitCardAddDto.csc;
          userDebitCard.billingaddress = debitCardAddDto.billingaddress;
          userDebitCard.user_id = debitCardAddDto.user_id;
          let DebitCard = await this.userDebitCardRepository.save(
            userDebitCard,
          );
          await this.userDebitCardRepository.update(
            { user_id: debitCardAddDto.user_id },
            { active_flag: Flags.N },
          );
          await this.userDebitCardRepository.update(
            { id: DebitCard.id },
            { active_flag: Flags.Y },
          );
          return { statusCode: 200 };
        } catch (error) {
          return {
            statusCode: 500,
            message: [
              new InternalServerErrorException(error)['response']['name'],
            ],
            error: 'Bad Request',
          };
        }
      } else {
        return {
          statusCode: 500,
          message: ["Can't add Card Details Please Contant Admin"],
        };
      }
    }
  }

  async bankAdd(bankAddDto: bankAddDto) {
    const entityManager = getManager();
    let url: any = process.env.loanpaymenprourl_v2;
    let loanpayment_customertoken = '';
    const users = await entityManager.query(
      `select "loanpayment_ach_customertoken", "firstname", "lastname" from customer where user_id = '${bankAddDto.user_id}'`,
    );
    if (users.length > 0) {
      if (!users[0].loanpayment_ach_customertoken) {
        let data = {
          FirstName: users[0].firstname,
          LastName: users[0].lastname,
        };
        let config = {
          headers: {
            TransactionKey: process.env.BankCardAcquiring_Transaction_Key,
            'Content-type': 'application/json',
          },
        };
        let res = await this.httpService
          .post(url + 'ach/customers/add', data, config)
          .toPromise();
        res = res.data;
        if (res['Status'] == 'Success') {
          loanpayment_customertoken = res['CustomerToken'];
          this.customerRepository.update(
            { user_id: bankAddDto.user_id },
            { loanpayment_ach_customertoken: loanpayment_customertoken },
          );
        } else {
          return {
            statusCode: 500,
            message: ["Can't add Card Details Please Contant Admin"],
          };
        }
      } else {
        loanpayment_customertoken = users[0].loanpayment_ach_customertoken;
      }
    }

    if (loanpayment_customertoken.length > 0) {
      let data = {
        NameOnAccount: bankAddDto.holdername,
        AccountNumber: bankAddDto.accountnumber.toString(),
        RoutingNumber: bankAddDto.routingnumber.toString(),
      };
      let config = {
        headers: {
          TransactionKey: process.env.BankCardAcquiring_Transaction_Key,
          'Content-type': 'application/json',
        },
      };
      let res = await this.httpService
        .post(
          url +
            'ach/customers/' +
            loanpayment_customertoken +
            '/bankaccounts/add',
          data,
          config,
        )
        .toPromise();
      res = res.data;
      if (res['Status'] == 'Success') {
        try {
          let userBankAccount = new UserBankAccount();
          userBankAccount.loanpayment_paymentmethodtoken =
            res['PaymentMethodToken'];
          userBankAccount.bankname = bankAddDto.bankname;
          userBankAccount.holdername = bankAddDto.holdername;
          userBankAccount.routingnumber = bankAddDto.routingnumber;
          userBankAccount.accountnumber = bankAddDto.accountnumber;
          userBankAccount.user_id = bankAddDto.user_id;
          let BankAccount = await this.userBankAccountRepository.save(
            userBankAccount,
          );
          await this.userBankAccountRepository.update(
            { user_id: userBankAccount.user_id },
            { active_flag: Flags.N },
          );
          await this.userBankAccountRepository.update(
            { id: BankAccount.id },
            { active_flag: Flags.Y },
          );
          return { statusCode: 200 };
        } catch (error) {
          return {
            statusCode: 500,
            message: [
              new InternalServerErrorException(error)['response']['name'],
            ],
            error: 'Bad Request',
          };
        }
      } else {
        return {
          statusCode: 500,
          message: ["Can't add Card Details Please Contant Admin"],
        };
      }
    }
  }

  async getBankCardDetails(id) {
    const entityManager = getManager();
    try {
      let data = {};
      data['bankDetails'] = await this.userBankAccountRepository.find({
        where: { user_id: id, delete_flag: 'N' },
        order: { createdat: 'DESC' },
      });
      data['cardDetails'] = await this.userDebitCardRepository.find({
        where: { user_id: id, delete_flag: 'N' },
        order: { createdat: 'DESC' },
      });
      data['user_details'] = await this.customerRepository.findOne({
        select: ['autopayment'],
        where: { user_id: id },
      });
      return { statusCode: 200, data: data };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async bankChoose(userId, bankUpdateDto) {
    try {
      await this.userBankAccountRepository.update(
        { user_id: userId },
        { active_flag: Flags.N },
      );
      await this.userBankAccountRepository.update(
        { id: bankUpdateDto.bank_id },
        { active_flag: Flags.Y },
      );
      return { statusCode: 200 };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async cardChoose(userId, debitCardUpdateDto) {
    try {
      await this.userDebitCardRepository.update(
        { user_id: userId },
        { active_flag: Flags.N },
      );
      await this.userDebitCardRepository.update(
        { id: debitCardUpdateDto.card_id },
        { active_flag: Flags.Y },
      );
      return { statusCode: 200 };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async toggleAutoPay(userId, toggleValue) {
    try {
      await this.customerRepository.update(
        { user_id: userId },
        { autopayment: toggleValue.value ? Flags.Y : Flags.N },
      );
      return { statusCode: 200 };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async cardpayment(payamentid, loanid) {
    const entityManager = getManager();
    let url: any = process.env.loanpaymenprourl_v2;
    try {
      let paymentlist = await entityManager.query(
        `select id,amount from paymentschedule where loan_id = '${loanid}' and status_flag = 'UNPAID' order by "scheduledate" asc limit 1`,
      );
      let timezone = await entityManager.query(`select current_timestamp`);
      let account = await entityManager.query(
        `select t.id as id, t2.email as email, t.user_id as user_id from userdebitcard t join user t2 on t2.id = t.user_id where t.loanpayment_paymentmethodtoken = '${payamentid}'`,
      );
      let email = account[0]['email'];
      let user_id = account[0]['user_id'];
      let accountid = account[0]['id'];
      timezone = timezone[0]['current_timestamp'];
      if (paymentlist.length > 0) {
        let data = {
          Amount: paymentlist[0].amount.toString(),
        };
        let config = {
          headers: {
            TransactionKey: process.env.BankCardAcquiring_Transaction_Key,
            'Content-type': 'application/json',
          },
        };
        let res = await this.httpService
          .post(
            url + 'payments/paymentcards/' + payamentid + '/run',
            data,
            config,
          )
          .toPromise();
        res = res.data;
        let Transaction = new TransactionEntity();
        Transaction.authcode = res['authcode'];
        Transaction.message = res['message'];
        Transaction.status = res['Status'];
        Transaction.transactionid = res['transactionid'];
        Transaction.account_id = accountid;
        Transaction.accountmethod = method.card;
        Transaction.amount = paymentlist[0].amount.toString();
        Transaction.payment = payment.Loan;
        Transaction.loan_id = loanid;
        await this.transactionRepository.save(Transaction);
        let log = new LogEntity();
        log.module =
          'LoanPayment - transactionid: ' +
          res['transactionid'] +
          ', Amount:' +
          paymentlist[0].amount.toString() +
          ', Status: ' +
          res['status'];
        log.user_id = user_id;
        log.loan_id = loanid;
        await this.logRepository.save(log);
        this.savenotification(
          'Payment Request',
          'transactionid: ' +
            res['transactionid'] +
            ', Amount:' +
            paymentlist[0].amount.toString(),
        );
        this.mailService.payment(
          email,
          paymentlist[0].amount.toString(),
          res['status'],
          res['transactionid'],
        );
        this.paymentScheduleRepository.update(
          { id: paymentlist[0]['id'] },
          {
            status_flag: StatusFlags.PAID,
            paidat: timezone,
            transactionid: res['transactionid'],
          },
        );

        return {
          statusCode: 200,
          Status: res['status'],
          transactionid: res['transactionid'],
          amount: paymentlist[0].amount.toString(),
        };
      } else {
        return { statusCode: 200 };
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async savenotification(title, msg) {
    let noti = new Notification();
    noti.title = title;
    noti.message = msg;
    await this.notificationRepository.save(noti);
  }
}
