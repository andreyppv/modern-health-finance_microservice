import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentscheduleRepository } from '../../repository/paymentschedule.repository';
import { PaymentscheduleEntity } from '../../entities/paymentschedule.entity';
import { LogRepository } from '../../repository/log.repository';
import { LoanRepository } from '../../repository/loan.repository';
import { UploadUserDocumentRepository } from '../../repository/userdocumentupload.repository';
import { UploadfilesService } from '../uploadfiles/uploadfiles.service';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import { UserRepository } from 'src/repository/users.repository';
import { BankTransactions } from '../../entities/bankTransaction.entity';
import { BankTransactionsRepository } from '../../repository/bankTransaction.repository';
import { BankAccountsRepository } from '../../repository/bankAccount.repository';
import { BankAccounts,Flags } from 'src/entities/bankAccount.entity';
@Injectable()
export class V1migrationService {
  constructor(
    @InjectRepository(UploadUserDocumentRepository)
    private readonly uploadUserDocumentRepository: UploadUserDocumentRepository,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    @InjectRepository(PaymentscheduleRepository)
    private readonly paymentscheduleRepository: PaymentscheduleRepository,
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectSendGrid() private readonly client: SendGridService,
    @InjectRepository(BankTransactionsRepository)
    private readonly bankTransactionsRepo: BankTransactionsRepository,  
    @InjectRepository(BankAccountsRepository)
    private readonly bankAccountRepo: BankAccountsRepository,
  ) {}
  async migrationPlaidTransactions(){
    try {
      const entityManager = getManager();
      let v1PlaidTrans = await entityManager.query(`select v1_transactions,id from plaidaccesstokenmaster t where is_migrated = 'N' and v1_transactions notnull`);
      if(v1PlaidTrans.length > 0){
        for(let i=0;i<v1PlaidTrans.length;i++){
          let v2AccountDetails = await entityManager.query(`select ac.ref_accountid,ac.id from plaidaccesstokenmaster plaisaccess 
          join bankaccounts ac on ac.plaid_access_token_master_id = plaisaccess.id 
          where ac.is_migrated = 'N' and v1_transactions notnull and plaisaccess.id = '${v1PlaidTrans[i].id}' 
          `);
          if(v2AccountDetails != null && v2AccountDetails . length > 0){
            for(let j=0;j<v2AccountDetails.length;j++){
              let parseV1PlaidTrans = JSON.parse(v1PlaidTrans[i].v1_transactions)[v2AccountDetails[j].ref_accountid];
              if(parseV1PlaidTrans != null && parseV1PlaidTrans.length > 0){
                
                let transactionArray = [];
                for(let k = 0;k<parseV1PlaidTrans.length;k++){
                  let BankTransaction = new BankTransactions();
                  console.log(parseV1PlaidTrans[k]['amount']);
                    BankTransaction.bankaccountid = v2AccountDetails[j].id;
                    BankTransaction.amount = parseV1PlaidTrans[k]['amount'];
                    if (
                      parseV1PlaidTrans[k]['category'] &&
                      parseV1PlaidTrans[k]['category'].length > 0
                    ) {
                      BankTransaction.category = parseV1PlaidTrans[k][
                        'category'
                      ].toString();
                    } else {
                      BankTransaction.category = 'unknown';
                    }
                    BankTransaction.category_id = parseV1PlaidTrans[k]['category_id']
                      ? parseV1PlaidTrans[k]['category_id']
                      : 'unknown';
                    BankTransaction.date = parseV1PlaidTrans[k]['date'];
                    BankTransaction.name = parseV1PlaidTrans[k]['name'];
                    BankTransaction.account_id = parseV1PlaidTrans[k]['account_id'];
                    transactionArray.push(BankTransaction);
                }
                await entityManager.query(`delete  from banktransactions t where bankaccountid
                in (select id from bankaccounts t where plaid_access_token_master_id = '${v1PlaidTrans[i].id}' and ref_accountid = '${v2AccountDetails[j].id}')`)
                let saveResponse = await this.bankTransactionsRepo.save(
                  transactionArray,
                );
                if(saveResponse != null && saveResponse.length > 0){
                  await this.bankAccountRepo.update(
                    { id: v2AccountDetails[j].id },
                    { is_migrated: Flags.Y },
                  );
                }  
               
              }
            }
            

          }

        }
        console.log("successfully migrated");
      }

      return { statusCode: 200, Message: "Successfully Plaid Transactions Migrated" };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
}
