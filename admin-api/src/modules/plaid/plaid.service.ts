import { TokenDto } from './dto/token-plaid.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CustomerRepository } from '../../repository/customer.repository';
import { BankAccountsRepository } from '../../repository/bankAccount.repository';
import { BankTransactionsRepository } from '../../repository/bankTransaction.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Flags } from '../../entities/bankAccount.entity';
import { getManager } from 'typeorm';
import { MailService } from '../../mail/mail.service';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import { OwnerInformationRepository } from '../../repository/ownerInformation.repository';
import { OwnerInformation } from '../../entities/ownerInformation.entity';
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  ItemPublicTokenExchangeRequest,
} from 'plaid';
import { BankAccounts } from '../../entities/bankAccount.entity';
import { BankTransactions } from '../../entities/bankTransaction.entity';
import { LoanRepository } from '../../repository/loan.repository';
import { EmailAddress } from '@sendgrid/helpers/classes';
import { json } from 'express';
import { PlaidAccessTokenMasterRepository } from 'src/repository/plaidAccessTokenMaster.repository';
import { Flags as plaidTokenFlags } from 'src/entities/plaidAccessTokenMaster.entity';
import * as moment from 'moment-timezone';
import { HttpService } from '@nestjs/axios';


@Injectable()
export class PlaidService {
  constructor(
    @InjectRepository(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
    @InjectRepository(BankAccountsRepository)
    private readonly bankAccountsRepository: BankAccountsRepository,
    @InjectRepository(BankTransactionsRepository)
    private readonly bankTransactionsRepository: BankTransactionsRepository,
    @InjectSendGrid() private readonly client: SendGridService,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    @InjectRepository(OwnerInformationRepository)
    private readonly ownerInformationRepository: OwnerInformationRepository,
    @InjectRepository(PlaidAccessTokenMasterRepository) private readonly plaidAccessTokenMasterRepository: PlaidAccessTokenMasterRepository,
    private httpService: HttpService,
  ) {}

  //Save Token API
  async savetoken(id, access_token, reconnect) {
    try {
      this.customerRepository.update(
        { loan_id: id },
        { plaid_access_token: access_token },
      );
      if (reconnect == true) {
        const data = await this.loanRepository.update(
          { id: id },
          { lastscreen: 'completed' },
        );
      } else {
        const data = await this.loanRepository.update(
          { id: id },
          { lastscreen: 'document' },
        );
      }
      await this.deleteInformation(id);
      return { statusCode: 200, data: 'user will be relogin successfully' };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async accounts(id) {
    try { 
      let banks = []
      let plaidAccessTokens = await this.plaidAccessTokenMasterRepository.find({loan_id:id, delete_flag: plaidTokenFlags.N })
      if(plaidAccessTokens.length){          
        for(let p=0; p<plaidAccessTokens.length; p++){
          let bankAccounts = await this.bankAccountsRepository.find({where:{loan_id: id, plaid_access_token_master_id: plaidAccessTokens[p].id, delete_flag: Flags.N}})
          if(bankAccounts.length>0){
            for(let i=0; i<bankAccounts.length; i++){
              let bankTransactionsRes = await this.bankTransactionsRepository.find({where: {bankaccountid: bankAccounts[i].id}})
              bankAccounts[i]['transactions'] = bankTransactionsRes;
            }
          }
          let parse_flinks_Attribute = (plaidAccessTokens[p].flinksattr != null)?JSON.parse(plaidAccessTokens[p].flinksattr):'';
          
          banks.push({bankname: plaidAccessTokens[p].institutionname, bankAccounts: bankAccounts,flinksAttr : parse_flinks_Attribute})
        }
        return {"statusCode": 200, data:banks }; 
      }else{          
        return {"statusCode": 100, "message":"No Accounts Available"}                  
      }
    } catch (error) {
      return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }
  async request_bank_login(id) {
    const entityManager = getManager();
    const mail = new MailService(this.client);
    try {
      mail.mail(id, 'Plaid Relogin');
      this.loanRepository.update({ id: id }, { lastscreen: 'bank reconnect' });
      return { statusCode: 200 };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async transactions(id) {
    const entityManager = getManager();
    try {
      const rawData: any = await entityManager.query(
        `SELECT plaid_access_token from customer where loan_id = '${id}' and plaid_access_token is not null;`,
      );
      if (rawData.length > 0) {
        const configuration = new Configuration({
          basePath: PlaidEnvironments.sandbox,
          baseOptions: {
            headers: {
              'PLAID-CLIENT-ID': process.env.PLAID_CLIENTID,
              'PLAID-SECRET': process.env.PLAIND_SECRETKEY,
            },
          },
        });
        try {
          const client = new PlaidApi(configuration);
          const d = new Date();
          const d1 = new Date();
          d1.setDate(d1.getDate() - 90);
          const today = d.toISOString().split('T')[0];
          const thirtyDaysAgo = d1.toISOString().split('T')[0];
          const response = await client.transactionsGet({
            access_token: rawData[0]['plaid_access_token'],
            start_date: thirtyDaysAgo,
            end_date: today,
          });
          return { statusCode: 200, data: response.data.transactions };
        } catch (error) {
          console.log(error);
          return {
            statusCode: 400,
            message: error.response.data.error_message,
          };
        }
      } else {
        return { statusCode: 200, data: rawData };
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async repullAccounts(id) {
    const entityManager = getManager();
    try {
      const rawData: any = await entityManager.query(
        `SELECT plaid_access_token from customer where loan_id = '${id}' and plaid_access_token is not null;`,
      );
      if (rawData.length > 0) {
        const configuration = new Configuration({
          basePath: PlaidEnvironments.sandbox,
          baseOptions: {
            headers: {
              'PLAID-CLIENT-ID': process.env.PLAID_CLIENTID,
              'PLAID-SECRET': process.env.PLAIND_SECRETKEY,
            },
          },
        });

        try {
          const delteInformation = await this.deleteInformation(id);
          const client = new PlaidApi(configuration);
          const accounts_response = await client.authGet({
            access_token: rawData[0]['plaid_access_token'],
          });
          //console.log('accounts_response', accounts_response.data);
          const iden = await client.identityGet({
            client_id: process.env.PLAID_CLIENTID,
            secret: process.env.PLAIND_SECRETKEY,
            access_token: rawData[0]['plaid_access_token'],
          });
          let owner = iden.data.accounts[0].owners;
          for (let i = 0; i < iden.data.accounts.length; i++) {
            if (iden.data.accounts[i].subtype == 'savings') {
              owner = iden.data.accounts[i].owners;
              break;
            }
          }
          const ownerInformation = new OwnerInformation();
          ownerInformation.type = 'savings';
          ownerInformation.owner = JSON.stringify(owner);
          ownerInformation.loan_id = id;
          await this.ownerInformationRepository.save(ownerInformation);
          const d = new Date();
          const d1 = new Date();
          d1.setDate(d1.getDate() - 90);
          const today = d.toISOString().split('T')[0];
          const thirtyDaysAgo = d1.toISOString().split('T')[0];
          const response = await client.transactionsGet({
            access_token: rawData[0]['plaid_access_token'],
            start_date: thirtyDaysAgo,
            end_date: today,
          });

          const transactions = response.data.transactions;
          const ac = accounts_response.data.accounts;
          const ach = accounts_response.data.numbers.ach;
          // console.log('ach', ach);

          //delete old accounts

          const bankAccountsRes = await this.bankAccountsRepository.find({
            loan_id: id,
            delete_flag: Flags.N,
          });
          if (bankAccountsRes.length > 0) {
            for (let i = 0; i < bankAccountsRes.length; i++) {
              await this.bankAccountsRepository.update(
                { id: bankAccountsRes[i].id, delete_flag: Flags.N },
                { delete_flag: Flags.Y },
              );
            }
          }

          const accountArray = [];
          for (let j = 0; j < ac.length; j++) {
            const BankAccount = new BankAccounts();
            BankAccount.loan_id = id;
            BankAccount.name = ac[j]['name'].replace('Plaid ', '');
            BankAccount.type = ac[j]['type'];
            BankAccount.subtype = ac[j]['subtype'];
            BankAccount.acno = 'XXXXXXXXXXXX' + ac[j]['mask'];

            //for only checking & saving type accounts
            let is_routing = false;
            for (let i = 0; i < ach.length; i++) {
              if (ac[j]['account_id'] == ach[i]['account_id']) {
                BankAccount.headername =
                  ac[j]['name'].replace('Plaid ', '') +
                  ' - XXXXXXXXXXXX' +
                  ac[j]['mask'];
                BankAccount.routing = ach[i]['routing'];
                BankAccount.wire_routing = ach[i]['wire_routing'];

                is_routing = true;
                break;
              }
            }
            if (!is_routing) {
              BankAccount.headername = ac[j]['name'].replace('Plaid ', '');
              BankAccount.routing = null;
              BankAccount.wire_routing = null;
            }

            BankAccount.institution_id =
              accounts_response.data.item['institution_id'];
            BankAccount.available = ac[j]['balances']['available'];
            BankAccount.current = ac[j]['balances']['current'];

            const account_res: any = await this.bankAccountsRepository.save(
              BankAccount,
            );

            const transactionArray = [];
            for (let k = 0; k < transactions.length; k++) {
              if (ac[j]['account_id'] == transactions[k]['account_id']) {
                const BankTransaction = new BankTransactions();
                BankTransaction.bankaccountid = account_res.id;
                BankTransaction.amount = transactions[k]['amount'];
                BankTransaction.category = transactions[k]['category'].join(
                  ',',
                );
                BankTransaction.category_id = transactions[k]['category_id'];
                BankTransaction.date = transactions[k]['date'];
                BankTransaction.name = transactions[k]['name'];

                transactionArray.push(BankTransaction);
              }
            }

            const transaction_res = await this.bankTransactionsRepository.save(
              transactionArray,
            );

            account_res['transactions'] = transaction_res;
            accountArray.push(account_res);
          }

          return { statusCode: 200, data: accountArray };
        } catch (error) {
          console.log(error);
          return {
            statusCode: 400,
            message: error.response.data.error_message,
          };
        }
      } else {
        return { statusCode: 200, data: rawData };
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async deleteInformation(id) {
    const bankAccountDetails = await this.bankAccountsRepository.find({
      loan_id: id,
    });
    if (bankAccountDetails) {
      bankAccountDetails.forEach(async bankAccountDetails => {
        const transactionDetails = await this.bankTransactionsRepository.find({
          bankaccountid: bankAccountDetails.id,
        });
        if (transactionDetails) {
          transactionDetails.forEach(async transactionDetails => {
            const deleteTransactionDetails = await this.bankTransactionsRepository.delete(
              {
                bankaccountid: bankAccountDetails.id,
              },
            );
          });
        }
      });
      const delteBankAccountDetails = await this.bankAccountsRepository.delete({
        loan_id: id,
      });
      const deleteOwnerInformation = await this.ownerInformationRepository.delete(
        { loan_id: id },
      );
    }
    return {
      statusCode: 200,
      data: 'User information deleted successfully',
    };
  }
  async getHistoricalBalance(id) {
    const entityManager = getManager();
    let data: any = {};
    try {
      const accdata = await entityManager.query(
        `select acno from bankaccounts where loan_id = '${id}'`,
      );
      for(let ac=0;ac<accdata.length;ac++){
        data[accdata[ac].acno] = await entityManager.query(
          `select his.amount,his.date,his.currency,ban.acno,ban.wire_routing  from 
          bankaccounts ban join historicalbalance his on his.bankaccountid = ban .id 
          where ban.loan_id = '${id}' and ban.acno = '${accdata[ac].acno}'`,
        );
      }
      return { statusCode: 200, data: data, acno:accdata};
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async btrrule(id){
    try{
      const entityManager = getManager();
      const transaction = await entityManager.query(
        `select t2.* from bankaccounts t 
        join banktransactions t2 on t2.bankaccountid = t.id 
        where t.loan_id = '${id}'
        and t.delete_flag = 'N' order by t2."date" desc`,
      );

      const bankaccount = await entityManager.query(
        `select * from bankaccounts t where t.loan_id = '${id}'`,
      );

      const balance = await entityManager.query(
        `select t2.* from bankaccounts t 
        join historicalbalance t2 on t2.bankaccountid = t.id 
        where t.loan_id = '${id}'
        and t.delete_flag = 'N' order by t2."date" desc `,
      );

      let credit_report = {
        "creditScore": 782,
        "monthlyDebt": 1854,
        "screenTracking": {
          "creditScore": 782,
          "isMil": true,
          "isNoHit": false,
          "isOfac": true,
          "transUnion": {
            "id": 0,
            "addOnProduct": [
              {
                "code": "06500",
                "status": "delivered",
                "idMismatchAlert": null,
                "scoreModel": null,
                "ofacNameScreen": null,
                "militaryLendingActSearch": null,
                "highRiskFraudAlert": {
                  "message": {
                    "source": "input",
                    "code": "3008"
                  },
                  "identificationIssuance": [
                    {
                      "source": "input",
                      "type": "ssn",
                      "alertMessageCode": "5504",
                      "yearRange": {
                        "startYear": 1992,
                        "endYear": 1992
                      },
                      "state": "NM",
                      "ageObtained": {
                        "rangeStart": "+00",
                        "rangeEnd": "+00"
                      }
                    },
                    {
                      "source": "file",
                      "type": "ssn",
                      "alertMessageCode": "5504",
                      "yearRange": {
                        "startYear": 1992,
                        "endYear": 1992
                      },
                      "state": "NM",
                      "ageObtained": {
                        "rangeStart": "-07",
                        "rangeEnd": "-06"
                      }
                    }
                  ]
                }
              },
              {
                "code": "001NN",
                "status": "defaultDelivered",
                "idMismatchAlert": null,
                "scoreModel": {
                  "score": {
                    "results": "+782",
                    "derogatoryAlert": false,
                    "fileInquiriesImpactedScore": false,
                    "factors": {
                      "factor": [
                        {
                          "rank": 1,
                          "code": "64",
                          "description": null
                        },
                        {
                          "rank": 2,
                          "code": "49",
                          "description": null
                        },
                        {
                          "rank": 3,
                          "code": "65",
                          "description": null
                        },
                        {
                          "rank": 4,
                          "code": "28",
                          "description": null
                        }
                      ]
                    },
                    "scoreCard": "07"
                  },
                  "characteristic": null
                },
                "ofacNameScreen": null,
                "militaryLendingActSearch": null,
                "highRiskFraudAlert": null
              },
              {
                "code": "00Y70",
                "status": "defaultDelivered",
                "idMismatchAlert": null,
                "scoreModel": {
                  "score": null,
                  "characteristic": {
                    "algorithmID": "00Y70",
                    "id": "CVVTG4RR",
                    "value": "067"
                  }
                },
                "ofacNameScreen": null,
                "militaryLendingActSearch": null,
                "highRiskFraudAlert": null
              },
              {
                "code": "06800",
                "status": "defaultDelivered",
                "idMismatchAlert": null,
                "scoreModel": null,
                "ofacNameScreen": {
                  "searchStatus": "clear"
                },
                "militaryLendingActSearch": null,
                "highRiskFraudAlert": null
              },
              {
                "code": "07051",
                "status": "delivered",
                "idMismatchAlert": null,
                "scoreModel": null,
                "ofacNameScreen": null,
                "militaryLendingActSearch": {
                  "searchStatus": "noMatch"
                },
                "highRiskFraudAlert": null
              }
            ],
            "creditCollection": null,
            "employment": [
              {
                "source": "file",
                "employer": {
                  "unparsed": "WELLS FARGO BANK"
                },
                "occupation": "TELLER",
                "dateOnFileSince": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "2022-03-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "2022-03-10T00:00:00"
                }
              },
              {
                "source": "file",
                "employer": {
                  "unparsed": "ABC"
                },
                "occupation": null,
                "dateOnFileSince": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "2022-03-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "2022-03-10T00:00:00"
                }
              }
            ],
            "firstname": "TEMEKA",
            "houseNumber": null,
            "inquiry": [
              {
                "ecoaDesignator": "individual",
                "subscriber": {
                  "industryCode": "F",
                  "memberCode": "05082333",
                  "inquirySubscriberPrefixCode": "06TR",
                  "name": {
                    "unparsed": "WELCOME TECH"
                  }
                },
                "accountType": null,
                "date": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "2022-04-29T00:00:00"
                },
                "requestor": null
              }
            ],
            "isNoHit": false,
            "isOfac": true,
            "isMil": true,
            "lastname": "ADAMS",
            "middlename": "RESHA",
            "publicRecord": null,
            "response": {
              "product": {
                "code": "07000",
                "subject": {
                  "number": 1,
                  "subjectRecord": {
                    "fileNumber": 1,
                    "fileSummary": {
                      "fileHitIndicator": "regularHit",
                      "ssnMatchIndicator": "exact",
                      "consumerStatementIndicator": false,
                      "market": "12",
                      "submarket": "LA",
                      "creditDataStatus": {
                        "suppressed": false,
                        "doNotPromote": {
                          "indicator": false
                        },
                        "freeze": {
                          "indicator": false
                        },
                        "minor": false,
                        "disputed": false
                      },
                      "inFileSinceDate": {
                        "estimatedDay": false,
                        "estimatedMonth": false,
                        "estimatedCentury": false,
                        "estimatedYear": false,
                        "value": "2017-12-31T00:00:00"
                      }
                    },
                    "indicative": {
                      "name": [
                        {
                          "source": "file",
                          "person": {
                            "first": "TEMEKA",
                            "middle": "RESHA",
                            "last": "ADAMS"
                          }
                        }
                      ],
                      "address": [
                        {
                          "source": "file",
                          "status": "current",
                          "qualifier": "personal",
                          "street": {
                            "number": 8180,
                            "name": "BRIARWOOD",
                            "type": "ST",
                            "unit": {
                              "number": "10B"
                            }
                          },
                          "location": {
                            "city": "STANTON",
                            "state": "CA",
                            "zipcode": "90680"
                          },
                          "dateReported": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "2019-11-04T00:00:00"
                          }
                        }
                      ],
                      "socialSecurity": {
                        "source": "file",
                        "number": "666603693"
                      },
                      "dateOfBirth": {
                        "estimatedDay": true,
                        "estimatedMonth": true,
                        "estimatedCentury": false,
                        "estimatedYear": false,
                        "value": "1998-01-01T00:00:00"
                      },
                      "employment": [
                        {
                          "source": "file",
                          "employer": {
                            "unparsed": "WELLS FARGO BANK"
                          },
                          "occupation": "TELLER",
                          "dateOnFileSince": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "2022-03-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "2022-03-10T00:00:00"
                          }
                        },
                        {
                          "source": "file",
                          "employer": {
                            "unparsed": "ABC"
                          },
                          "occupation": null,
                          "dateOnFileSince": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "2022-03-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "2022-03-10T00:00:00"
                          }
                        }
                      ]
                    },
                    "custom": {
                      "credit": {
                        "trade": [
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "08737114",
                              "name": {
                                "unparsed": "COMERICA BK"
                              }
                            },
                            "portfolioType": "installment",
                            "accountnumber": "222229142476341",
                            "ecoaDesignator": "jointContractLiability",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000016000",
                            "creditLimit": null,
                            "accountRating": "01",
                            "remark": null,
                            "terms": {
                              "paymentFrequency": "monthly",
                              "paymentScheduleMonthCount": "120",
                              "scheduledMonthlyPayment": "000000235"
                            },
                            "account": {
                              "type": "HI"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": null,
                              "historicalCounters": null,
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": null,
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "06330016",
                              "name": {
                                "unparsed": "PEOPLES UNTD"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "222229010041",
                            "ecoaDesignator": "jointContractLiability",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "closedIndicator": "normal",
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000002738",
                            "creditLimit": 5800,
                            "accountRating": "01",
                            "remark": {
                              "code": "CBC",
                              "type": "affiliate"
                            },
                            "terms": null,
                            "account": {
                              "type": "CC"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2022-02-08T00:00:00",
                                "text": "111111111111111111111111111111111111111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "46",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": null,
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "07991190",
                              "name": {
                                "unparsed": "HSBC BANK"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "222225425002",
                            "ecoaDesignator": "jointContractLiability",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "currentBalance": "000000000",
                            "highCredit": "000005229",
                            "creditLimit": 11000,
                            "accountRating": "01",
                            "remark": null,
                            "terms": null,
                            "account": {
                              "type": "CC"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2022-01-10T00:00:00",
                                "text": "11111111111111111111111X111111111111111111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "48",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2022-01-10T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "0235197E",
                              "name": {
                                "unparsed": "HSBC/RS"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "22222001567",
                            "ecoaDesignator": "individual",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000000687",
                            "creditLimit": null,
                            "accountRating": "01",
                            "remark": {
                              "code": "CBC",
                              "type": "affiliate"
                            },
                            "terms": null,
                            "account": {
                              "type": "CH"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2022-01-09T00:00:00",
                                "text": "111111111111111111111111111111111111111111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "48",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2022-01-09T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "0640N038",
                              "name": {
                                "unparsed": "AMER GEN FIN"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "222226500546",
                            "ecoaDesignator": "individual",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": null,
                            "currentBalance": "000001181",
                            "highCredit": "000005000",
                            "creditLimit": 5000,
                            "accountRating": "01",
                            "remark": null,
                            "terms": null,
                            "account": {
                              "type": "CH"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2022-01-08T00:00:00",
                                "text": "1111111X1"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "09",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": null,
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "01LFG001",
                              "name": {
                                "unparsed": "PROVDN BNP"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "2382305235",
                            "ecoaDesignator": "individual",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000000000",
                            "creditLimit": 5000,
                            "accountRating": "01",
                            "remark": null,
                            "terms": null,
                            "account": {
                              "type": "CC"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": null,
                              "historicalCounters": null,
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": null,
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "D",
                              "memberCode": "0235008G",
                              "name": {
                                "unparsed": "GEMB/M WARD"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "2222242",
                            "ecoaDesignator": "participant",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": null,
                            "currentBalance": "000000199",
                            "highCredit": "000002785",
                            "creditLimit": 5000,
                            "accountRating": "01",
                            "remark": null,
                            "terms": null,
                            "account": null,
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2021-12-17T00:00:00",
                                "text": "111111111111111111111111111111111111111111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "48",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2022-01-11T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "F",
                              "memberCode": "0338S003",
                              "name": {
                                "unparsed": "WASH MTG CO"
                              }
                            },
                            "portfolioType": "mortgage",
                            "accountnumber": "2222212",
                            "ecoaDesignator": "jointContractLiability",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": null,
                            "currentBalance": "000116317",
                            "highCredit": "000118000",
                            "creditLimit": null,
                            "accountRating": "01",
                            "remark": null,
                            "terms": {
                              "paymentFrequency": "monthly",
                              "paymentScheduleMonthCount": "360",
                              "scheduledMonthlyPayment": "000000928"
                            },
                            "account": {
                              "type": "CV"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2021-12-14T00:00:00",
                                "text": "11111111111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "17",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2022-01-08T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "F",
                              "memberCode": "01W2N002",
                              "name": {
                                "unparsed": "CONTINENTAL"
                              }
                            },
                            "portfolioType": "installment",
                            "accountnumber": "22222166717641001",
                            "ecoaDesignator": "individual",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": null,
                            "currentBalance": "000013211",
                            "highCredit": "000015646",
                            "creditLimit": null,
                            "accountRating": "01",
                            "remark": null,
                            "terms": {
                              "paymentFrequency": "monthly",
                              "paymentScheduleMonthCount": "066",
                              "scheduledMonthlyPayment": "000000309"
                            },
                            "account": {
                              "type": "AU"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2021-12-13T00:00:00",
                                "text": "111111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "12",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2022-01-07T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "F",
                              "memberCode": "01W2N002",
                              "name": {
                                "unparsed": "CONTINENTAL"
                              }
                            },
                            "portfolioType": "installment",
                            "accountnumber": "22222167456951001",
                            "ecoaDesignator": "individual",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": null,
                            "currentBalance": "000012753",
                            "highCredit": "000013375",
                            "creditLimit": null,
                            "accountRating": "01",
                            "remark": null,
                            "terms": {
                              "paymentFrequency": "monthly",
                              "paymentScheduleMonthCount": "066",
                              "scheduledMonthlyPayment": "000000260"
                            },
                            "account": {
                              "type": "AU"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2021-12-10T00:00:00",
                                "text": "111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "03",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2022-01-05T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "0348D153",
                              "name": {
                                "unparsed": "JPMCB HOME"
                              }
                            },
                            "portfolioType": "installment",
                            "accountnumber": "22222220000176077",
                            "ecoaDesignator": "jointContractLiability",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": null,
                            "currentBalance": "000018000",
                            "highCredit": "000018000",
                            "creditLimit": null,
                            "accountRating": "01",
                            "remark": null,
                            "terms": {
                              "paymentFrequency": "monthly",
                              "paymentScheduleMonthCount": "084",
                              "scheduledMonthlyPayment": "000000281"
                            },
                            "account": {
                              "type": "SE"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": null,
                              "historicalCounters": null,
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": null,
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "0152B021",
                              "name": {
                                "unparsed": "SPIEGEL"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "222229",
                            "ecoaDesignator": "authorizedUser",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": null,
                            "currentBalance": "000000033",
                            "highCredit": "000006700",
                            "creditLimit": 6700,
                            "accountRating": "01",
                            "remark": null,
                            "terms": {
                              "paymentFrequency": null,
                              "paymentScheduleMonthCount": "MIN",
                              "scheduledMonthlyPayment": "000000015"
                            },
                            "account": {
                              "type": "CH"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2021-11-18T00:00:00",
                                "text": "1111111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "48",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2021-02-21T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "D",
                              "memberCode": "012EN001",
                              "name": {
                                "unparsed": "KOHLS/CHASE"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "2222268",
                            "ecoaDesignator": "participant",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": null,
                            "currentBalance": "000000024",
                            "highCredit": "000000456",
                            "creditLimit": 2000,
                            "accountRating": "01",
                            "remark": null,
                            "terms": {
                              "paymentFrequency": null,
                              "paymentScheduleMonthCount": "MIN",
                              "scheduledMonthlyPayment": "000000010"
                            },
                            "account": {
                              "type": "CC"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2021-11-11T00:00:00",
                                "text": "11111111111111111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "23",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2021-12-06T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "D",
                              "memberCode": "01249003",
                              "name": {
                                "unparsed": "RNB-MERVYN"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "2222268",
                            "ecoaDesignator": "jointContractLiability",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": null,
                            "currentBalance": "000000326",
                            "highCredit": "000000622",
                            "creditLimit": 800,
                            "accountRating": "01",
                            "remark": null,
                            "terms": {
                              "paymentFrequency": null,
                              "paymentScheduleMonthCount": "MIN",
                              "scheduledMonthlyPayment": "000000017"
                            },
                            "account": {
                              "type": "CH"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2021-09-06T00:00:00",
                                "text": "111111111111111111111111111111111111111111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "48",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": null,
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "07519027",
                              "name": {
                                "unparsed": "FST USA BK B"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "222221295336",
                            "ecoaDesignator": "individual",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "closedIndicator": "normal",
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000008000",
                            "creditLimit": 8000,
                            "accountRating": "01",
                            "remark": {
                              "code": "CBC",
                              "type": "affiliate"
                            },
                            "terms": null,
                            "account": {
                              "type": "CC"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2021-09-04T00:00:00",
                                "text": "111111111111XXXX111111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "28",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2018-11-30T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "Q",
                              "memberCode": "01607092",
                              "name": {
                                "unparsed": "FOA LEASING"
                              }
                            },
                            "portfolioType": "installment",
                            "accountnumber": "2222209434",
                            "ecoaDesignator": "individual",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "closedIndicator": "normal",
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000005790",
                            "creditLimit": null,
                            "accountRating": "01",
                            "remark": {
                              "code": "CLO",
                              "type": "affiliate"
                            },
                            "terms": {
                              "paymentFrequency": "monthly",
                              "paymentScheduleMonthCount": "024",
                              "scheduledMonthlyPayment": "000000241"
                            },
                            "account": {
                              "type": "LE"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2021-08-11T00:00:00",
                                "text": "X1X111111111111X111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "25",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2021-09-10T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "092WL001",
                              "name": {
                                "unparsed": "HSBC BANK"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "222220032387",
                            "ecoaDesignator": "authorizedUser",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": null,
                            "currentBalance": "000001467",
                            "highCredit": "000001499",
                            "creditLimit": 8000,
                            "accountRating": "01",
                            "remark": null,
                            "terms": {
                              "paymentFrequency": null,
                              "paymentScheduleMonthCount": "MIN",
                              "scheduledMonthlyPayment": "000000030"
                            },
                            "account": {
                              "type": "CC"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2021-07-18T00:00:00",
                                "text": "111111111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "16",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2021-07-02T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "D",
                              "memberCode": "06256397",
                              "name": {
                                "unparsed": "CBUSASEARS"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "222222980",
                            "ecoaDesignator": "individual",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": null,
                            "currentBalance": "000002049",
                            "highCredit": "000002080",
                            "creditLimit": 5300,
                            "accountRating": "01",
                            "remark": null,
                            "terms": {
                              "paymentFrequency": null,
                              "paymentScheduleMonthCount": "MIN",
                              "scheduledMonthlyPayment": "000000049"
                            },
                            "account": {
                              "type": "CH"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2021-06-30T00:00:00",
                                "text": "111111111111111111111111111111111111111111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "48",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": null,
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "H",
                              "memberCode": "01184058",
                              "name": {
                                "unparsed": "CTBK/GARDNER"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "2222223",
                            "ecoaDesignator": "participant",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "currentBalance": "000000000",
                            "highCredit": "000001425",
                            "creditLimit": 4200,
                            "accountRating": "01",
                            "remark": null,
                            "terms": null,
                            "account": null,
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": null,
                              "historicalCounters": null,
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2016-07-06T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "H",
                              "memberCode": "01NZ8007",
                              "name": {
                                "unparsed": "CCB/GRDWHI"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "222227550023",
                            "ecoaDesignator": "participant",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "closedIndicator": "normal",
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000001425",
                            "creditLimit": 4200,
                            "accountRating": "01",
                            "remark": {
                              "code": "CLO",
                              "type": "affiliate"
                            },
                            "terms": null,
                            "account": null,
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": null,
                              "historicalCounters": {
                                "monthsReviewedCount": "48",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2016-08-10T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "F",
                              "memberCode": "03796540",
                              "name": {
                                "unparsed": "FRD MOTOR CR"
                              }
                            },
                            "portfolioType": "installment",
                            "accountnumber": "2222273H28",
                            "ecoaDesignator": "individual",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "closedIndicator": "normal",
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000018409",
                            "creditLimit": null,
                            "accountRating": "01",
                            "remark": null,
                            "terms": {
                              "paymentFrequency": "monthly",
                              "paymentScheduleMonthCount": "060",
                              "scheduledMonthlyPayment": "000000306"
                            },
                            "account": {
                              "type": "AU"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2020-12-31T00:00:00",
                                "text": "X11X11111X1X11X11111X111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "32",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2020-12-06T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "01DTV001",
                              "name": {
                                "unparsed": "CAPITAL ONE"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "222227143840",
                            "ecoaDesignator": "individual",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "closedIndicator": "normal",
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000003915",
                            "creditLimit": null,
                            "accountRating": "01",
                            "remark": {
                              "code": "CBC",
                              "type": "affiliate"
                            },
                            "terms": null,
                            "account": {
                              "type": "CC"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2020-11-15T00:00:00",
                                "text": "1111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "10",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2020-06-03T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "0624P004",
                              "name": {
                                "unparsed": "ABN-AMRO"
                              }
                            },
                            "portfolioType": "mortgage",
                            "accountnumber": "2222210027233",
                            "ecoaDesignator": "jointContractLiability",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "closedIndicator": "normal",
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000100900",
                            "creditLimit": null,
                            "accountRating": "01",
                            "remark": {
                              "code": "CLO",
                              "type": "affiliate"
                            },
                            "terms": {
                              "paymentFrequency": "monthly",
                              "paymentScheduleMonthCount": "360",
                              "scheduledMonthlyPayment": "000000881"
                            },
                            "account": {
                              "type": "CV"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2020-06-01T00:00:00",
                                "text": "111X111111111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "19",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2020-06-13T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "0517R022",
                              "name": {
                                "unparsed": "FLEET CC"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "222229004200",
                            "ecoaDesignator": "authorizedUser",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "closedIndicator": "normal",
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000008000",
                            "creditLimit": 8000,
                            "accountRating": "01",
                            "remark": {
                              "code": "CLO",
                              "type": "affiliate"
                            },
                            "terms": null,
                            "account": {
                              "type": "CC"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2020-04-07T00:00:00",
                                "text": "111111111111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "18",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2018-08-09T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "0402D017",
                              "name": {
                                "unparsed": "CHASE NA"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "222220010119",
                            "ecoaDesignator": "individual",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "closedIndicator": "normal",
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": null,
                            "creditLimit": 4500,
                            "accountRating": "01",
                            "remark": {
                              "code": "CLO",
                              "type": "affiliate"
                            },
                            "terms": null,
                            "account": {
                              "type": "CC"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2019-11-17T00:00:00",
                                "text": "111111111111X1111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "19",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2018-08-08T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "01DTV001",
                              "name": {
                                "unparsed": "CAPITAL ONE"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "222224129347",
                            "ecoaDesignator": "jointContractLiability",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "closedIndicator": "normal",
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000005199",
                            "creditLimit": null,
                            "accountRating": "01",
                            "remark": {
                              "code": "CBC",
                              "type": "affiliate"
                            },
                            "terms": null,
                            "account": {
                              "type": "CC"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2019-11-16T00:00:00",
                                "text": "111111X1XX11111X11XX111111111X11XX1"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "46",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2019-03-16T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "0624P004",
                              "name": {
                                "unparsed": "ABN-AMRO"
                              }
                            },
                            "portfolioType": "mortgage",
                            "accountnumber": "22222763886",
                            "ecoaDesignator": "individual",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "closedIndicator": "normal",
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000079900",
                            "creditLimit": null,
                            "accountRating": "01",
                            "remark": {
                              "code": "CLO",
                              "type": "affiliate"
                            },
                            "terms": {
                              "paymentFrequency": "monthly",
                              "paymentScheduleMonthCount": "360",
                              "scheduledMonthlyPayment": "000000786"
                            },
                            "account": {
                              "type": "CV"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2018-10-18T00:00:00",
                                "text": "X1111111111111111111X1111111111X1111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "42",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2018-11-30T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "062SV017",
                              "name": {
                                "unparsed": "FOA BK"
                              }
                            },
                            "portfolioType": "installment",
                            "accountnumber": "22222971312276369",
                            "ecoaDesignator": "individual",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "closedIndicator": "normal",
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000005895",
                            "creditLimit": null,
                            "accountRating": "01",
                            "remark": {
                              "code": "CLO",
                              "type": "affiliate"
                            },
                            "terms": {
                              "paymentFrequency": "monthly",
                              "paymentScheduleMonthCount": "048",
                              "scheduledMonthlyPayment": null
                            },
                            "account": {
                              "type": "AU"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2018-07-19T00:00:00",
                                "text": "X111111X111111111X1111111X111X1X1XX1111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "39",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2018-08-11T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "D",
                              "memberCode": "0590S008",
                              "name": {
                                "unparsed": "RNB-FIELD1"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "22222529",
                            "ecoaDesignator": "participant",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "currentBalance": "000000000",
                            "highCredit": "000001800",
                            "creditLimit": 1800,
                            "accountRating": "01",
                            "remark": {
                              "code": "CBC",
                              "type": "affiliate"
                            },
                            "terms": null,
                            "account": null,
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": null,
                              "historicalCounters": {
                                "monthsReviewedCount": "12",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2017-04-21T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "D",
                              "memberCode": "06476004",
                              "name": {
                                "unparsed": "TARGET N.B."
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "22222529",
                            "ecoaDesignator": "participant",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "currentBalance": "000000000",
                            "highCredit": "000000800",
                            "creditLimit": 800,
                            "accountRating": "01",
                            "remark": {
                              "code": "CBC",
                              "type": "affiliate"
                            },
                            "terms": null,
                            "account": null,
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": null,
                              "historicalCounters": {
                                "monthsReviewedCount": "12",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2017-04-17T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "062SV017",
                              "name": {
                                "unparsed": "FOA BK"
                              }
                            },
                            "portfolioType": "installment",
                            "accountnumber": "22222972061358607",
                            "ecoaDesignator": "individual",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "closedIndicator": "normal",
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000006361",
                            "creditLimit": null,
                            "accountRating": "01",
                            "remark": {
                              "code": "CLO",
                              "type": "affiliate"
                            },
                            "terms": {
                              "paymentFrequency": "monthly",
                              "paymentScheduleMonthCount": "048",
                              "scheduledMonthlyPayment": "000000163"
                            },
                            "account": {
                              "type": "AU"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2018-04-06T00:00:00",
                                "text": "X111X111111111X1111111X11"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "25",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2018-05-31T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "0517R022",
                              "name": {
                                "unparsed": "FLEET CC"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "222229002207",
                            "ecoaDesignator": "jointContractLiability",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "closedIndicator": "normal",
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": null,
                            "creditLimit": 6000,
                            "accountRating": "01",
                            "remark": {
                              "code": "CLO",
                              "type": "affiliate"
                            },
                            "terms": null,
                            "account": {
                              "type": "CC"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": null,
                              "historicalCounters": {
                                "monthsReviewedCount": "02",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": null,
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "09202010",
                              "name": {
                                "unparsed": "CHEVY CHASE"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "222225200441",
                            "ecoaDesignator": "jointContractLiability",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "closedIndicator": "normal",
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000002366",
                            "creditLimit": 12800,
                            "accountRating": "01",
                            "remark": {
                              "code": "CLO",
                              "type": "affiliate"
                            },
                            "terms": null,
                            "account": {
                              "type": "CC"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2018-02-12T00:00:00",
                                "text": "111111111111111111111111111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "33",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2017-04-19T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "D",
                              "memberCode": "01972010",
                              "name": {
                                "unparsed": "JCP-MCCBG"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "22222833",
                            "ecoaDesignator": "jointContractLiability",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000000710",
                            "creditLimit": null,
                            "accountRating": "01",
                            "remark": {
                              "code": "CBC",
                              "type": "affiliate"
                            },
                            "terms": null,
                            "account": null,
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2017-03-17T00:00:00",
                                "text": "11111111111111111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "23",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": null,
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "H",
                              "memberCode": "085TR001",
                              "name": {
                                "unparsed": "BNB/GW"
                              }
                            },
                            "portfolioType": "installment",
                            "accountnumber": "2222275500230818",
                            "ecoaDesignator": "participant",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "closedIndicator": "normal",
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000001425",
                            "creditLimit": null,
                            "accountRating": "01",
                            "remark": null,
                            "terms": {
                              "paymentFrequency": "monthly",
                              "paymentScheduleMonthCount": "010",
                              "scheduledMonthlyPayment": null
                            },
                            "account": {
                              "type": "CO"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2016-09-10T00:00:00",
                                "text": "1111111111111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "19",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2016-08-07T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "0211Q002",
                              "name": {
                                "unparsed": "HUNTNGTON BK"
                              }
                            },
                            "portfolioType": "installment",
                            "accountnumber": "222229300489",
                            "ecoaDesignator": "individual",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "currentBalance": "000000000",
                            "highCredit": "000006658",
                            "creditLimit": null,
                            "accountRating": "01",
                            "remark": null,
                            "terms": {
                              "paymentFrequency": "monthly",
                              "paymentScheduleMonthCount": "042",
                              "scheduledMonthlyPayment": "000000204"
                            },
                            "account": {
                              "type": "AU"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": null,
                              "historicalCounters": null,
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": null,
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "B",
                              "memberCode": "064DB003",
                              "name": {
                                "unparsed": "CITI"
                              }
                            },
                            "portfolioType": "revolving",
                            "accountnumber": "222220225238",
                            "ecoaDesignator": "individual",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": null,
                            "closedIndicator": null,
                            "datePaidOut": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "currentBalance": "000000000",
                            "highCredit": null,
                            "creditLimit": null,
                            "accountRating": "01",
                            "remark": null,
                            "terms": null,
                            "account": {
                              "type": "CC"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": null,
                              "historicalCounters": null,
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2012-09-12T00:00:00"
                            },
                            "updateMethod": "manual"
                          },
                          {
                            "subscriber": {
                              "industryCode": "F",
                              "memberCode": "0624C151",
                              "name": {
                                "unparsed": "CHRYSLR FIN"
                              }
                            },
                            "portfolioType": "installment",
                            "accountnumber": "2222257898",
                            "ecoaDesignator": "individual",
                            "dateOpened": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateEffective": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "dateClosed": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "0001-01-01T00:00:00"
                            },
                            "closedIndicator": "normal",
                            "datePaidOut": null,
                            "currentBalance": "000000000",
                            "highCredit": "000015988",
                            "creditLimit": null,
                            "accountRating": "UR",
                            "remark": {
                              "code": "CLO",
                              "type": "affiliate"
                            },
                            "terms": {
                              "paymentFrequency": "monthly",
                              "paymentScheduleMonthCount": "061",
                              "scheduledMonthlyPayment": null
                            },
                            "account": {
                              "type": "AU"
                            },
                            "pastDue": "000000000",
                            "paymentHistory": {
                              "paymentPattern": {
                                "startDate": "2016-03-30T00:00:00",
                                "text": "11111111111"
                              },
                              "historicalCounters": {
                                "monthsReviewedCount": "11",
                                "late30DaysTotal": "00",
                                "late60DaysTotal": "00",
                                "late90DaysTotal": "00"
                              },
                              "maxDelinquency": null
                            },
                            "mostRecentPayment": {
                              "date": "2016-04-18T00:00:00"
                            },
                            "updateMethod": "manual"
                          }
                        ],
                        "inquiry": [
                          {
                            "ecoaDesignator": "individual",
                            "subscriber": {
                              "industryCode": "F",
                              "memberCode": "05082333",
                              "inquirySubscriberPrefixCode": "06TR",
                              "name": {
                                "unparsed": "WELCOME TECH"
                              }
                            },
                            "accountType": null,
                            "date": {
                              "estimatedDay": false,
                              "estimatedMonth": false,
                              "estimatedCentury": false,
                              "estimatedYear": false,
                              "value": "2022-04-29T00:00:00"
                            },
                            "requestor": null
                          }
                        ],
                        "publicRecord": null,
                        "collection": []
                      }
                    },
                    "addOnProduct": [
                      {
                        "code": "06500",
                        "status": "delivered",
                        "idMismatchAlert": null,
                        "scoreModel": null,
                        "ofacNameScreen": null,
                        "militaryLendingActSearch": null,
                        "highRiskFraudAlert": {
                          "message": {
                            "source": "input",
                            "code": "3008"
                          },
                          "identificationIssuance": [
                            {
                              "source": "input",
                              "type": "ssn",
                              "alertMessageCode": "5504",
                              "yearRange": {
                                "startYear": 1992,
                                "endYear": 1992
                              },
                              "state": "NM",
                              "ageObtained": {
                                "rangeStart": "+00",
                                "rangeEnd": "+00"
                              }
                            },
                            {
                              "source": "file",
                              "type": "ssn",
                              "alertMessageCode": "5504",
                              "yearRange": {
                                "startYear": 1992,
                                "endYear": 1992
                              },
                              "state": "NM",
                              "ageObtained": {
                                "rangeStart": "-07",
                                "rangeEnd": "-06"
                              }
                            }
                          ]
                        }
                      },
                      {
                        "code": "001NN",
                        "status": "defaultDelivered",
                        "idMismatchAlert": null,
                        "scoreModel": {
                          "score": {
                            "results": "+782",
                            "derogatoryAlert": false,
                            "fileInquiriesImpactedScore": false,
                            "factors": {
                              "factor": [
                                {
                                  "rank": 1,
                                  "code": "64",
                                  "description": null
                                },
                                {
                                  "rank": 2,
                                  "code": "49",
                                  "description": null
                                },
                                {
                                  "rank": 3,
                                  "code": "65",
                                  "description": null
                                },
                                {
                                  "rank": 4,
                                  "code": "28",
                                  "description": null
                                }
                              ]
                            },
                            "scoreCard": "07"
                          },
                          "characteristic": null
                        },
                        "ofacNameScreen": null,
                        "militaryLendingActSearch": null,
                        "highRiskFraudAlert": null
                      },
                      {
                        "code": "00Y70",
                        "status": "defaultDelivered",
                        "idMismatchAlert": null,
                        "scoreModel": {
                          "score": null,
                          "characteristic": {
                            "algorithmID": "00Y70",
                            "id": "CVVTG4RR",
                            "value": "067"
                          }
                        },
                        "ofacNameScreen": null,
                        "militaryLendingActSearch": null,
                        "highRiskFraudAlert": null
                      },
                      {
                        "code": "06800",
                        "status": "defaultDelivered",
                        "idMismatchAlert": null,
                        "scoreModel": null,
                        "ofacNameScreen": {
                          "searchStatus": "clear"
                        },
                        "militaryLendingActSearch": null,
                        "highRiskFraudAlert": null
                      },
                      {
                        "code": "07051",
                        "status": "delivered",
                        "idMismatchAlert": null,
                        "scoreModel": null,
                        "ofacNameScreen": null,
                        "militaryLendingActSearch": {
                          "searchStatus": "noMatch"
                        },
                        "highRiskFraudAlert": null
                      }
                    ]
                  }
                },
                "error": null
              },
              "document": "response",
              "version": "2.21",
              "transactionControl": {
                "userRefNumber": "1",
                "subscriber": {
                  "industryCode": "F",
                  "memberCode": "F5082333",
                  "inquirySubscriberPrefixCode": "0622"
                },
                "options": {
                  "country": "us",
                  "language": "en",
                  "productVersion": "standard"
                },
                "tracking": {
                  "transactionTimeStamp": "2022-04-29T13:09:28.941+00:00"
                }
              }
            },
            "score": "+782",
            "socialSecurity": "666603693",
            "status": 0,
            "trade": [
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "08737114",
                  "name": {
                    "unparsed": "COMERICA BK"
                  }
                },
                "portfolioType": "installment",
                "accountnumber": "222229142476341",
                "ecoaDesignator": "jointContractLiability",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000016000",
                "creditLimit": null,
                "accountRating": "01",
                "remark": null,
                "terms": {
                  "paymentFrequency": "monthly",
                  "paymentScheduleMonthCount": "120",
                  "scheduledMonthlyPayment": "000000235"
                },
                "account": {
                  "type": "HI"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": null,
                  "historicalCounters": null,
                  "maxDelinquency": null
                },
                "mostRecentPayment": null,
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "06330016",
                  "name": {
                    "unparsed": "PEOPLES UNTD"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "222229010041",
                "ecoaDesignator": "jointContractLiability",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "closedIndicator": "normal",
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000002738",
                "creditLimit": 5800,
                "accountRating": "01",
                "remark": {
                  "code": "CBC",
                  "type": "affiliate"
                },
                "terms": null,
                "account": {
                  "type": "CC"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2022-02-08T00:00:00",
                    "text": "111111111111111111111111111111111111111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "46",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": null,
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "07991190",
                  "name": {
                    "unparsed": "HSBC BANK"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "222225425002",
                "ecoaDesignator": "jointContractLiability",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "currentBalance": "000000000",
                "highCredit": "000005229",
                "creditLimit": 11000,
                "accountRating": "01",
                "remark": null,
                "terms": null,
                "account": {
                  "type": "CC"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2022-01-10T00:00:00",
                    "text": "11111111111111111111111X111111111111111111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "48",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2022-01-10T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "0235197E",
                  "name": {
                    "unparsed": "HSBC/RS"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "22222001567",
                "ecoaDesignator": "individual",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000000687",
                "creditLimit": null,
                "accountRating": "01",
                "remark": {
                  "code": "CBC",
                  "type": "affiliate"
                },
                "terms": null,
                "account": {
                  "type": "CH"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2022-01-09T00:00:00",
                    "text": "111111111111111111111111111111111111111111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "48",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2022-01-09T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "0640N038",
                  "name": {
                    "unparsed": "AMER GEN FIN"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "222226500546",
                "ecoaDesignator": "individual",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": null,
                "currentBalance": "000001181",
                "highCredit": "000005000",
                "creditLimit": 5000,
                "accountRating": "01",
                "remark": null,
                "terms": null,
                "account": {
                  "type": "CH"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2022-01-08T00:00:00",
                    "text": "1111111X1"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "09",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": null,
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "01LFG001",
                  "name": {
                    "unparsed": "PROVDN BNP"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "2382305235",
                "ecoaDesignator": "individual",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000000000",
                "creditLimit": 5000,
                "accountRating": "01",
                "remark": null,
                "terms": null,
                "account": {
                  "type": "CC"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": null,
                  "historicalCounters": null,
                  "maxDelinquency": null
                },
                "mostRecentPayment": null,
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "D",
                  "memberCode": "0235008G",
                  "name": {
                    "unparsed": "GEMB/M WARD"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "2222242",
                "ecoaDesignator": "participant",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": null,
                "currentBalance": "000000199",
                "highCredit": "000002785",
                "creditLimit": 5000,
                "accountRating": "01",
                "remark": null,
                "terms": null,
                "account": null,
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2021-12-17T00:00:00",
                    "text": "111111111111111111111111111111111111111111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "48",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2022-01-11T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "F",
                  "memberCode": "0338S003",
                  "name": {
                    "unparsed": "WASH MTG CO"
                  }
                },
                "portfolioType": "mortgage",
                "accountnumber": "2222212",
                "ecoaDesignator": "jointContractLiability",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": null,
                "currentBalance": "000116317",
                "highCredit": "000118000",
                "creditLimit": null,
                "accountRating": "01",
                "remark": null,
                "terms": {
                  "paymentFrequency": "monthly",
                  "paymentScheduleMonthCount": "360",
                  "scheduledMonthlyPayment": "000000928"
                },
                "account": {
                  "type": "CV"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2021-12-14T00:00:00",
                    "text": "11111111111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "17",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2022-01-08T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "F",
                  "memberCode": "01W2N002",
                  "name": {
                    "unparsed": "CONTINENTAL"
                  }
                },
                "portfolioType": "installment",
                "accountnumber": "22222166717641001",
                "ecoaDesignator": "individual",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": null,
                "currentBalance": "000013211",
                "highCredit": "000015646",
                "creditLimit": null,
                "accountRating": "01",
                "remark": null,
                "terms": {
                  "paymentFrequency": "monthly",
                  "paymentScheduleMonthCount": "066",
                  "scheduledMonthlyPayment": "000000309"
                },
                "account": {
                  "type": "AU"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2021-12-13T00:00:00",
                    "text": "111111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "12",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2022-01-07T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "F",
                  "memberCode": "01W2N002",
                  "name": {
                    "unparsed": "CONTINENTAL"
                  }
                },
                "portfolioType": "installment",
                "accountnumber": "22222167456951001",
                "ecoaDesignator": "individual",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": null,
                "currentBalance": "000012753",
                "highCredit": "000013375",
                "creditLimit": null,
                "accountRating": "01",
                "remark": null,
                "terms": {
                  "paymentFrequency": "monthly",
                  "paymentScheduleMonthCount": "066",
                  "scheduledMonthlyPayment": "000000260"
                },
                "account": {
                  "type": "AU"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2021-12-10T00:00:00",
                    "text": "111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "03",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2022-01-05T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "0348D153",
                  "name": {
                    "unparsed": "JPMCB HOME"
                  }
                },
                "portfolioType": "installment",
                "accountnumber": "22222220000176077",
                "ecoaDesignator": "jointContractLiability",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": null,
                "currentBalance": "000018000",
                "highCredit": "000018000",
                "creditLimit": null,
                "accountRating": "01",
                "remark": null,
                "terms": {
                  "paymentFrequency": "monthly",
                  "paymentScheduleMonthCount": "084",
                  "scheduledMonthlyPayment": "000000281"
                },
                "account": {
                  "type": "SE"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": null,
                  "historicalCounters": null,
                  "maxDelinquency": null
                },
                "mostRecentPayment": null,
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "0152B021",
                  "name": {
                    "unparsed": "SPIEGEL"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "222229",
                "ecoaDesignator": "authorizedUser",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": null,
                "currentBalance": "000000033",
                "highCredit": "000006700",
                "creditLimit": 6700,
                "accountRating": "01",
                "remark": null,
                "terms": {
                  "paymentFrequency": null,
                  "paymentScheduleMonthCount": "MIN",
                  "scheduledMonthlyPayment": "000000015"
                },
                "account": {
                  "type": "CH"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2021-11-18T00:00:00",
                    "text": "1111111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "48",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2021-02-21T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "D",
                  "memberCode": "012EN001",
                  "name": {
                    "unparsed": "KOHLS/CHASE"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "2222268",
                "ecoaDesignator": "participant",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": null,
                "currentBalance": "000000024",
                "highCredit": "000000456",
                "creditLimit": 2000,
                "accountRating": "01",
                "remark": null,
                "terms": {
                  "paymentFrequency": null,
                  "paymentScheduleMonthCount": "MIN",
                  "scheduledMonthlyPayment": "000000010"
                },
                "account": {
                  "type": "CC"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2021-11-11T00:00:00",
                    "text": "11111111111111111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "23",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2021-12-06T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "D",
                  "memberCode": "01249003",
                  "name": {
                    "unparsed": "RNB-MERVYN"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "2222268",
                "ecoaDesignator": "jointContractLiability",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": null,
                "currentBalance": "000000326",
                "highCredit": "000000622",
                "creditLimit": 800,
                "accountRating": "01",
                "remark": null,
                "terms": {
                  "paymentFrequency": null,
                  "paymentScheduleMonthCount": "MIN",
                  "scheduledMonthlyPayment": "000000017"
                },
                "account": {
                  "type": "CH"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2021-09-06T00:00:00",
                    "text": "111111111111111111111111111111111111111111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "48",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": null,
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "07519027",
                  "name": {
                    "unparsed": "FST USA BK B"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "222221295336",
                "ecoaDesignator": "individual",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "closedIndicator": "normal",
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000008000",
                "creditLimit": 8000,
                "accountRating": "01",
                "remark": {
                  "code": "CBC",
                  "type": "affiliate"
                },
                "terms": null,
                "account": {
                  "type": "CC"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2021-09-04T00:00:00",
                    "text": "111111111111XXXX111111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "28",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2018-11-30T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "Q",
                  "memberCode": "01607092",
                  "name": {
                    "unparsed": "FOA LEASING"
                  }
                },
                "portfolioType": "installment",
                "accountnumber": "2222209434",
                "ecoaDesignator": "individual",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "closedIndicator": "normal",
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000005790",
                "creditLimit": null,
                "accountRating": "01",
                "remark": {
                  "code": "CLO",
                  "type": "affiliate"
                },
                "terms": {
                  "paymentFrequency": "monthly",
                  "paymentScheduleMonthCount": "024",
                  "scheduledMonthlyPayment": "000000241"
                },
                "account": {
                  "type": "LE"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2021-08-11T00:00:00",
                    "text": "X1X111111111111X111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "25",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2021-09-10T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "092WL001",
                  "name": {
                    "unparsed": "HSBC BANK"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "222220032387",
                "ecoaDesignator": "authorizedUser",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": null,
                "currentBalance": "000001467",
                "highCredit": "000001499",
                "creditLimit": 8000,
                "accountRating": "01",
                "remark": null,
                "terms": {
                  "paymentFrequency": null,
                  "paymentScheduleMonthCount": "MIN",
                  "scheduledMonthlyPayment": "000000030"
                },
                "account": {
                  "type": "CC"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2021-07-18T00:00:00",
                    "text": "111111111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "16",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2021-07-02T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "D",
                  "memberCode": "06256397",
                  "name": {
                    "unparsed": "CBUSASEARS"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "222222980",
                "ecoaDesignator": "individual",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": null,
                "currentBalance": "000002049",
                "highCredit": "000002080",
                "creditLimit": 5300,
                "accountRating": "01",
                "remark": null,
                "terms": {
                  "paymentFrequency": null,
                  "paymentScheduleMonthCount": "MIN",
                  "scheduledMonthlyPayment": "000000049"
                },
                "account": {
                  "type": "CH"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2021-06-30T00:00:00",
                    "text": "111111111111111111111111111111111111111111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "48",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": null,
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "H",
                  "memberCode": "01184058",
                  "name": {
                    "unparsed": "CTBK/GARDNER"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "2222223",
                "ecoaDesignator": "participant",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "currentBalance": "000000000",
                "highCredit": "000001425",
                "creditLimit": 4200,
                "accountRating": "01",
                "remark": null,
                "terms": null,
                "account": null,
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": null,
                  "historicalCounters": null,
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2016-07-06T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "H",
                  "memberCode": "01NZ8007",
                  "name": {
                    "unparsed": "CCB/GRDWHI"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "222227550023",
                "ecoaDesignator": "participant",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "closedIndicator": "normal",
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000001425",
                "creditLimit": 4200,
                "accountRating": "01",
                "remark": {
                  "code": "CLO",
                  "type": "affiliate"
                },
                "terms": null,
                "account": null,
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": null,
                  "historicalCounters": {
                    "monthsReviewedCount": "48",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2016-08-10T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "F",
                  "memberCode": "03796540",
                  "name": {
                    "unparsed": "FRD MOTOR CR"
                  }
                },
                "portfolioType": "installment",
                "accountnumber": "2222273H28",
                "ecoaDesignator": "individual",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "closedIndicator": "normal",
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000018409",
                "creditLimit": null,
                "accountRating": "01",
                "remark": null,
                "terms": {
                  "paymentFrequency": "monthly",
                  "paymentScheduleMonthCount": "060",
                  "scheduledMonthlyPayment": "000000306"
                },
                "account": {
                  "type": "AU"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2020-12-31T00:00:00",
                    "text": "X11X11111X1X11X11111X111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "32",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2020-12-06T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "01DTV001",
                  "name": {
                    "unparsed": "CAPITAL ONE"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "222227143840",
                "ecoaDesignator": "individual",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "closedIndicator": "normal",
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000003915",
                "creditLimit": null,
                "accountRating": "01",
                "remark": {
                  "code": "CBC",
                  "type": "affiliate"
                },
                "terms": null,
                "account": {
                  "type": "CC"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2020-11-15T00:00:00",
                    "text": "1111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "10",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2020-06-03T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "0624P004",
                  "name": {
                    "unparsed": "ABN-AMRO"
                  }
                },
                "portfolioType": "mortgage",
                "accountnumber": "2222210027233",
                "ecoaDesignator": "jointContractLiability",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "closedIndicator": "normal",
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000100900",
                "creditLimit": null,
                "accountRating": "01",
                "remark": {
                  "code": "CLO",
                  "type": "affiliate"
                },
                "terms": {
                  "paymentFrequency": "monthly",
                  "paymentScheduleMonthCount": "360",
                  "scheduledMonthlyPayment": "000000881"
                },
                "account": {
                  "type": "CV"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2020-06-01T00:00:00",
                    "text": "111X111111111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "19",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2020-06-13T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "0517R022",
                  "name": {
                    "unparsed": "FLEET CC"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "222229004200",
                "ecoaDesignator": "authorizedUser",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "closedIndicator": "normal",
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000008000",
                "creditLimit": 8000,
                "accountRating": "01",
                "remark": {
                  "code": "CLO",
                  "type": "affiliate"
                },
                "terms": null,
                "account": {
                  "type": "CC"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2020-04-07T00:00:00",
                    "text": "111111111111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "18",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2018-08-09T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "0402D017",
                  "name": {
                    "unparsed": "CHASE NA"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "222220010119",
                "ecoaDesignator": "individual",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "closedIndicator": "normal",
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": null,
                "creditLimit": 4500,
                "accountRating": "01",
                "remark": {
                  "code": "CLO",
                  "type": "affiliate"
                },
                "terms": null,
                "account": {
                  "type": "CC"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2019-11-17T00:00:00",
                    "text": "111111111111X1111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "19",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2018-08-08T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "01DTV001",
                  "name": {
                    "unparsed": "CAPITAL ONE"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "222224129347",
                "ecoaDesignator": "jointContractLiability",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "closedIndicator": "normal",
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000005199",
                "creditLimit": null,
                "accountRating": "01",
                "remark": {
                  "code": "CBC",
                  "type": "affiliate"
                },
                "terms": null,
                "account": {
                  "type": "CC"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2019-11-16T00:00:00",
                    "text": "111111X1XX11111X11XX111111111X11XX1"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "46",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2019-03-16T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "0624P004",
                  "name": {
                    "unparsed": "ABN-AMRO"
                  }
                },
                "portfolioType": "mortgage",
                "accountnumber": "22222763886",
                "ecoaDesignator": "individual",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "closedIndicator": "normal",
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000079900",
                "creditLimit": null,
                "accountRating": "01",
                "remark": {
                  "code": "CLO",
                  "type": "affiliate"
                },
                "terms": {
                  "paymentFrequency": "monthly",
                  "paymentScheduleMonthCount": "360",
                  "scheduledMonthlyPayment": "000000786"
                },
                "account": {
                  "type": "CV"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2018-10-18T00:00:00",
                    "text": "X1111111111111111111X1111111111X1111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "42",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2018-11-30T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "062SV017",
                  "name": {
                    "unparsed": "FOA BK"
                  }
                },
                "portfolioType": "installment",
                "accountnumber": "22222971312276369",
                "ecoaDesignator": "individual",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "closedIndicator": "normal",
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000005895",
                "creditLimit": null,
                "accountRating": "01",
                "remark": {
                  "code": "CLO",
                  "type": "affiliate"
                },
                "terms": {
                  "paymentFrequency": "monthly",
                  "paymentScheduleMonthCount": "048",
                  "scheduledMonthlyPayment": null
                },
                "account": {
                  "type": "AU"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2018-07-19T00:00:00",
                    "text": "X111111X111111111X1111111X111X1X1XX1111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "39",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2018-08-11T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "D",
                  "memberCode": "0590S008",
                  "name": {
                    "unparsed": "RNB-FIELD1"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "22222529",
                "ecoaDesignator": "participant",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "currentBalance": "000000000",
                "highCredit": "000001800",
                "creditLimit": 1800,
                "accountRating": "01",
                "remark": {
                  "code": "CBC",
                  "type": "affiliate"
                },
                "terms": null,
                "account": null,
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": null,
                  "historicalCounters": {
                    "monthsReviewedCount": "12",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2017-04-21T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "D",
                  "memberCode": "06476004",
                  "name": {
                    "unparsed": "TARGET N.B."
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "22222529",
                "ecoaDesignator": "participant",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "currentBalance": "000000000",
                "highCredit": "000000800",
                "creditLimit": 800,
                "accountRating": "01",
                "remark": {
                  "code": "CBC",
                  "type": "affiliate"
                },
                "terms": null,
                "account": null,
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": null,
                  "historicalCounters": {
                    "monthsReviewedCount": "12",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2017-04-17T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "062SV017",
                  "name": {
                    "unparsed": "FOA BK"
                  }
                },
                "portfolioType": "installment",
                "accountnumber": "22222972061358607",
                "ecoaDesignator": "individual",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "closedIndicator": "normal",
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000006361",
                "creditLimit": null,
                "accountRating": "01",
                "remark": {
                  "code": "CLO",
                  "type": "affiliate"
                },
                "terms": {
                  "paymentFrequency": "monthly",
                  "paymentScheduleMonthCount": "048",
                  "scheduledMonthlyPayment": "000000163"
                },
                "account": {
                  "type": "AU"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2018-04-06T00:00:00",
                    "text": "X111X111111111X1111111X11"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "25",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2018-05-31T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "0517R022",
                  "name": {
                    "unparsed": "FLEET CC"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "222229002207",
                "ecoaDesignator": "jointContractLiability",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "closedIndicator": "normal",
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": null,
                "creditLimit": 6000,
                "accountRating": "01",
                "remark": {
                  "code": "CLO",
                  "type": "affiliate"
                },
                "terms": null,
                "account": {
                  "type": "CC"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": null,
                  "historicalCounters": {
                    "monthsReviewedCount": "02",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": null,
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "09202010",
                  "name": {
                    "unparsed": "CHEVY CHASE"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "222225200441",
                "ecoaDesignator": "jointContractLiability",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "closedIndicator": "normal",
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000002366",
                "creditLimit": 12800,
                "accountRating": "01",
                "remark": {
                  "code": "CLO",
                  "type": "affiliate"
                },
                "terms": null,
                "account": {
                  "type": "CC"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2018-02-12T00:00:00",
                    "text": "111111111111111111111111111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "33",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2017-04-19T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "D",
                  "memberCode": "01972010",
                  "name": {
                    "unparsed": "JCP-MCCBG"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "22222833",
                "ecoaDesignator": "jointContractLiability",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000000710",
                "creditLimit": null,
                "accountRating": "01",
                "remark": {
                  "code": "CBC",
                  "type": "affiliate"
                },
                "terms": null,
                "account": null,
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2017-03-17T00:00:00",
                    "text": "11111111111111111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "23",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": null,
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "H",
                  "memberCode": "085TR001",
                  "name": {
                    "unparsed": "BNB/GW"
                  }
                },
                "portfolioType": "installment",
                "accountnumber": "2222275500230818",
                "ecoaDesignator": "participant",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "closedIndicator": "normal",
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000001425",
                "creditLimit": null,
                "accountRating": "01",
                "remark": null,
                "terms": {
                  "paymentFrequency": "monthly",
                  "paymentScheduleMonthCount": "010",
                  "scheduledMonthlyPayment": null
                },
                "account": {
                  "type": "CO"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2016-09-10T00:00:00",
                    "text": "1111111111111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "19",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2016-08-07T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "0211Q002",
                  "name": {
                    "unparsed": "HUNTNGTON BK"
                  }
                },
                "portfolioType": "installment",
                "accountnumber": "222229300489",
                "ecoaDesignator": "individual",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "currentBalance": "000000000",
                "highCredit": "000006658",
                "creditLimit": null,
                "accountRating": "01",
                "remark": null,
                "terms": {
                  "paymentFrequency": "monthly",
                  "paymentScheduleMonthCount": "042",
                  "scheduledMonthlyPayment": "000000204"
                },
                "account": {
                  "type": "AU"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": null,
                  "historicalCounters": null,
                  "maxDelinquency": null
                },
                "mostRecentPayment": null,
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "B",
                  "memberCode": "064DB003",
                  "name": {
                    "unparsed": "CITI"
                  }
                },
                "portfolioType": "revolving",
                "accountnumber": "222220225238",
                "ecoaDesignator": "individual",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": null,
                "closedIndicator": null,
                "datePaidOut": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "currentBalance": "000000000",
                "highCredit": null,
                "creditLimit": null,
                "accountRating": "01",
                "remark": null,
                "terms": null,
                "account": {
                  "type": "CC"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": null,
                  "historicalCounters": null,
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2012-09-12T00:00:00"
                },
                "updateMethod": "manual"
              },
              {
                "subscriber": {
                  "industryCode": "F",
                  "memberCode": "0624C151",
                  "name": {
                    "unparsed": "CHRYSLR FIN"
                  }
                },
                "portfolioType": "installment",
                "accountnumber": "2222257898",
                "ecoaDesignator": "individual",
                "dateOpened": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateEffective": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "dateClosed": {
                  "estimatedDay": false,
                  "estimatedMonth": false,
                  "estimatedCentury": false,
                  "estimatedYear": false,
                  "value": "0001-01-01T00:00:00"
                },
                "closedIndicator": "normal",
                "datePaidOut": null,
                "currentBalance": "000000000",
                "highCredit": "000015988",
                "creditLimit": null,
                "accountRating": "UR",
                "remark": {
                  "code": "CLO",
                  "type": "affiliate"
                },
                "terms": {
                  "paymentFrequency": "monthly",
                  "paymentScheduleMonthCount": "061",
                  "scheduledMonthlyPayment": null
                },
                "account": {
                  "type": "AU"
                },
                "pastDue": "000000000",
                "paymentHistory": {
                  "paymentPattern": {
                    "startDate": "2016-03-30T00:00:00",
                    "text": "11111111111"
                  },
                  "historicalCounters": {
                    "monthsReviewedCount": "11",
                    "late30DaysTotal": "00",
                    "late60DaysTotal": "00",
                    "late90DaysTotal": "00"
                  },
                  "maxDelinquency": null
                },
                "mostRecentPayment": {
                  "date": "2016-04-18T00:00:00"
                },
                "updateMethod": "manual"
              }
            ],
            "collection": [],
            "user": "1"
          }
        },
        "success": true,
        "transUnion": {
          "id": 0,
          "addOnProduct": [
            {
              "code": "06500",
              "status": "delivered",
              "idMismatchAlert": null,
              "scoreModel": null,
              "ofacNameScreen": null,
              "militaryLendingActSearch": null,
              "highRiskFraudAlert": {
                "message": {
                  "source": "input",
                  "code": "3008"
                },
                "identificationIssuance": [
                  {
                    "source": "input",
                    "type": "ssn",
                    "alertMessageCode": "5504",
                    "yearRange": {
                      "startYear": 1992,
                      "endYear": 1992
                    },
                    "state": "NM",
                    "ageObtained": {
                      "rangeStart": "+00",
                      "rangeEnd": "+00"
                    }
                  },
                  {
                    "source": "file",
                    "type": "ssn",
                    "alertMessageCode": "5504",
                    "yearRange": {
                      "startYear": 1992,
                      "endYear": 1992
                    },
                    "state": "NM",
                    "ageObtained": {
                      "rangeStart": "-07",
                      "rangeEnd": "-06"
                    }
                  }
                ]
              }
            },
            {
              "code": "001NN",
              "status": "defaultDelivered",
              "idMismatchAlert": null,
              "scoreModel": {
                "score": {
                  "results": "+782",
                  "derogatoryAlert": false,
                  "fileInquiriesImpactedScore": false,
                  "factors": {
                    "factor": [
                      {
                        "rank": 1,
                        "code": "64",
                        "description": null
                      },
                      {
                        "rank": 2,
                        "code": "49",
                        "description": null
                      },
                      {
                        "rank": 3,
                        "code": "65",
                        "description": null
                      },
                      {
                        "rank": 4,
                        "code": "28",
                        "description": null
                      }
                    ]
                  },
                  "scoreCard": "07"
                },
                "characteristic": null
              },
              "ofacNameScreen": null,
              "militaryLendingActSearch": null,
              "highRiskFraudAlert": null
            },
            {
              "code": "00Y70",
              "status": "defaultDelivered",
              "idMismatchAlert": null,
              "scoreModel": {
                "score": null,
                "characteristic": {
                  "algorithmID": "00Y70",
                  "id": "CVVTG4RR",
                  "value": "067"
                }
              },
              "ofacNameScreen": null,
              "militaryLendingActSearch": null,
              "highRiskFraudAlert": null
            },
            {
              "code": "06800",
              "status": "defaultDelivered",
              "idMismatchAlert": null,
              "scoreModel": null,
              "ofacNameScreen": {
                "searchStatus": "clear"
              },
              "militaryLendingActSearch": null,
              "highRiskFraudAlert": null
            },
            {
              "code": "07051",
              "status": "delivered",
              "idMismatchAlert": null,
              "scoreModel": null,
              "ofacNameScreen": null,
              "militaryLendingActSearch": {
                "searchStatus": "noMatch"
              },
              "highRiskFraudAlert": null
            }
          ],
          "creditCollection": null,
          "employment": [
            {
              "source": "file",
              "employer": {
                "unparsed": "WELLS FARGO BANK"
              },
              "occupation": "TELLER",
              "dateOnFileSince": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "2022-03-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "2022-03-10T00:00:00"
              }
            },
            {
              "source": "file",
              "employer": {
                "unparsed": "ABC"
              },
              "occupation": null,
              "dateOnFileSince": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "2022-03-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "2022-03-10T00:00:00"
              }
            }
          ],
          "firstname": "TEMEKA",
          "houseNumber": null,
          "inquiry": [
            {
              "ecoaDesignator": "individual",
              "subscriber": {
                "industryCode": "F",
                "memberCode": "05082333",
                "inquirySubscriberPrefixCode": "06TR",
                "name": {
                  "unparsed": "WELCOME TECH"
                }
              },
              "accountType": null,
              "date": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "2022-04-29T00:00:00"
              },
              "requestor": null
            }
          ],
          "isNoHit": false,
          "isOfac": true,
          "isMil": true,
          "lastname": "ADAMS",
          "middlename": "RESHA",
          "publicRecord": null,
          "response": {
            "product": {
              "code": "07000",
              "subject": {
                "number": 1,
                "subjectRecord": {
                  "fileNumber": 1,
                  "fileSummary": {
                    "fileHitIndicator": "regularHit",
                    "ssnMatchIndicator": "exact",
                    "consumerStatementIndicator": false,
                    "market": "12",
                    "submarket": "LA",
                    "creditDataStatus": {
                      "suppressed": false,
                      "doNotPromote": {
                        "indicator": false
                      },
                      "freeze": {
                        "indicator": false
                      },
                      "minor": false,
                      "disputed": false
                    },
                    "inFileSinceDate": {
                      "estimatedDay": false,
                      "estimatedMonth": false,
                      "estimatedCentury": false,
                      "estimatedYear": false,
                      "value": "2017-12-31T00:00:00"
                    }
                  },
                  "indicative": {
                    "name": [
                      {
                        "source": "file",
                        "person": {
                          "first": "TEMEKA",
                          "middle": "RESHA",
                          "last": "ADAMS"
                        }
                      }
                    ],
                    "address": [
                      {
                        "source": "file",
                        "status": "current",
                        "qualifier": "personal",
                        "street": {
                          "number": 8180,
                          "name": "BRIARWOOD",
                          "type": "ST",
                          "unit": {
                            "number": "10B"
                          }
                        },
                        "location": {
                          "city": "STANTON",
                          "state": "CA",
                          "zipcode": "90680"
                        },
                        "dateReported": {
                          "estimatedDay": false,
                          "estimatedMonth": false,
                          "estimatedCentury": false,
                          "estimatedYear": false,
                          "value": "2019-11-04T00:00:00"
                        }
                      }
                    ],
                    "socialSecurity": {
                      "source": "file",
                      "number": "666603693"
                    },
                    "dateOfBirth": {
                      "estimatedDay": true,
                      "estimatedMonth": true,
                      "estimatedCentury": false,
                      "estimatedYear": false,
                      "value": "1998-01-01T00:00:00"
                    },
                    "employment": [
                      {
                        "source": "file",
                        "employer": {
                          "unparsed": "WELLS FARGO BANK"
                        },
                        "occupation": "TELLER",
                        "dateOnFileSince": {
                          "estimatedDay": false,
                          "estimatedMonth": false,
                          "estimatedCentury": false,
                          "estimatedYear": false,
                          "value": "2022-03-01T00:00:00"
                        },
                        "dateEffective": {
                          "estimatedDay": false,
                          "estimatedMonth": false,
                          "estimatedCentury": false,
                          "estimatedYear": false,
                          "value": "2022-03-10T00:00:00"
                        }
                      },
                      {
                        "source": "file",
                        "employer": {
                          "unparsed": "ABC"
                        },
                        "occupation": null,
                        "dateOnFileSince": {
                          "estimatedDay": false,
                          "estimatedMonth": false,
                          "estimatedCentury": false,
                          "estimatedYear": false,
                          "value": "2022-03-01T00:00:00"
                        },
                        "dateEffective": {
                          "estimatedDay": false,
                          "estimatedMonth": false,
                          "estimatedCentury": false,
                          "estimatedYear": false,
                          "value": "2022-03-10T00:00:00"
                        }
                      }
                    ]
                  },
                  "custom": {
                    "credit": {
                      "trade": [
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "08737114",
                            "name": {
                              "unparsed": "COMERICA BK"
                            }
                          },
                          "portfolioType": "installment",
                          "accountnumber": "222229142476341",
                          "ecoaDesignator": "jointContractLiability",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000016000",
                          "creditLimit": null,
                          "accountRating": "01",
                          "remark": null,
                          "terms": {
                            "paymentFrequency": "monthly",
                            "paymentScheduleMonthCount": "120",
                            "scheduledMonthlyPayment": "000000235"
                          },
                          "account": {
                            "type": "HI"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": null,
                            "historicalCounters": null,
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": null,
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "06330016",
                            "name": {
                              "unparsed": "PEOPLES UNTD"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "222229010041",
                          "ecoaDesignator": "jointContractLiability",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "closedIndicator": "normal",
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000002738",
                          "creditLimit": 5800,
                          "accountRating": "01",
                          "remark": {
                            "code": "CBC",
                            "type": "affiliate"
                          },
                          "terms": null,
                          "account": {
                            "type": "CC"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2022-02-08T00:00:00",
                              "text": "111111111111111111111111111111111111111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "46",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": null,
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "07991190",
                            "name": {
                              "unparsed": "HSBC BANK"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "222225425002",
                          "ecoaDesignator": "jointContractLiability",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "currentBalance": "000000000",
                          "highCredit": "000005229",
                          "creditLimit": 11000,
                          "accountRating": "01",
                          "remark": null,
                          "terms": null,
                          "account": {
                            "type": "CC"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2022-01-10T00:00:00",
                              "text": "11111111111111111111111X111111111111111111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "48",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2022-01-10T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "0235197E",
                            "name": {
                              "unparsed": "HSBC/RS"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "22222001567",
                          "ecoaDesignator": "individual",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000000687",
                          "creditLimit": null,
                          "accountRating": "01",
                          "remark": {
                            "code": "CBC",
                            "type": "affiliate"
                          },
                          "terms": null,
                          "account": {
                            "type": "CH"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2022-01-09T00:00:00",
                              "text": "111111111111111111111111111111111111111111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "48",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2022-01-09T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "0640N038",
                            "name": {
                              "unparsed": "AMER GEN FIN"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "222226500546",
                          "ecoaDesignator": "individual",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": null,
                          "currentBalance": "000001181",
                          "highCredit": "000005000",
                          "creditLimit": 5000,
                          "accountRating": "01",
                          "remark": null,
                          "terms": null,
                          "account": {
                            "type": "CH"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2022-01-08T00:00:00",
                              "text": "1111111X1"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "09",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": null,
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "01LFG001",
                            "name": {
                              "unparsed": "PROVDN BNP"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "2382305235",
                          "ecoaDesignator": "individual",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000000000",
                          "creditLimit": 5000,
                          "accountRating": "01",
                          "remark": null,
                          "terms": null,
                          "account": {
                            "type": "CC"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": null,
                            "historicalCounters": null,
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": null,
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "D",
                            "memberCode": "0235008G",
                            "name": {
                              "unparsed": "GEMB/M WARD"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "2222242",
                          "ecoaDesignator": "participant",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": null,
                          "currentBalance": "000000199",
                          "highCredit": "000002785",
                          "creditLimit": 5000,
                          "accountRating": "01",
                          "remark": null,
                          "terms": null,
                          "account": null,
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2021-12-17T00:00:00",
                              "text": "111111111111111111111111111111111111111111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "48",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2022-01-11T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "F",
                            "memberCode": "0338S003",
                            "name": {
                              "unparsed": "WASH MTG CO"
                            }
                          },
                          "portfolioType": "mortgage",
                          "accountnumber": "2222212",
                          "ecoaDesignator": "jointContractLiability",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": null,
                          "currentBalance": "000116317",
                          "highCredit": "000118000",
                          "creditLimit": null,
                          "accountRating": "01",
                          "remark": null,
                          "terms": {
                            "paymentFrequency": "monthly",
                            "paymentScheduleMonthCount": "360",
                            "scheduledMonthlyPayment": "000000928"
                          },
                          "account": {
                            "type": "CV"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2021-12-14T00:00:00",
                              "text": "11111111111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "17",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2022-01-08T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "F",
                            "memberCode": "01W2N002",
                            "name": {
                              "unparsed": "CONTINENTAL"
                            }
                          },
                          "portfolioType": "installment",
                          "accountnumber": "22222166717641001",
                          "ecoaDesignator": "individual",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": null,
                          "currentBalance": "000013211",
                          "highCredit": "000015646",
                          "creditLimit": null,
                          "accountRating": "01",
                          "remark": null,
                          "terms": {
                            "paymentFrequency": "monthly",
                            "paymentScheduleMonthCount": "066",
                            "scheduledMonthlyPayment": "000000309"
                          },
                          "account": {
                            "type": "AU"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2021-12-13T00:00:00",
                              "text": "111111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "12",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2022-01-07T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "F",
                            "memberCode": "01W2N002",
                            "name": {
                              "unparsed": "CONTINENTAL"
                            }
                          },
                          "portfolioType": "installment",
                          "accountnumber": "22222167456951001",
                          "ecoaDesignator": "individual",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": null,
                          "currentBalance": "000012753",
                          "highCredit": "000013375",
                          "creditLimit": null,
                          "accountRating": "01",
                          "remark": null,
                          "terms": {
                            "paymentFrequency": "monthly",
                            "paymentScheduleMonthCount": "066",
                            "scheduledMonthlyPayment": "000000260"
                          },
                          "account": {
                            "type": "AU"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2021-12-10T00:00:00",
                              "text": "111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "03",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2022-01-05T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "0348D153",
                            "name": {
                              "unparsed": "JPMCB HOME"
                            }
                          },
                          "portfolioType": "installment",
                          "accountnumber": "22222220000176077",
                          "ecoaDesignator": "jointContractLiability",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": null,
                          "currentBalance": "000018000",
                          "highCredit": "000018000",
                          "creditLimit": null,
                          "accountRating": "01",
                          "remark": null,
                          "terms": {
                            "paymentFrequency": "monthly",
                            "paymentScheduleMonthCount": "084",
                            "scheduledMonthlyPayment": "000000281"
                          },
                          "account": {
                            "type": "SE"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": null,
                            "historicalCounters": null,
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": null,
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "0152B021",
                            "name": {
                              "unparsed": "SPIEGEL"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "222229",
                          "ecoaDesignator": "authorizedUser",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": null,
                          "currentBalance": "000000033",
                          "highCredit": "000006700",
                          "creditLimit": 6700,
                          "accountRating": "01",
                          "remark": null,
                          "terms": {
                            "paymentFrequency": null,
                            "paymentScheduleMonthCount": "MIN",
                            "scheduledMonthlyPayment": "000000015"
                          },
                          "account": {
                            "type": "CH"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2021-11-18T00:00:00",
                              "text": "1111111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "48",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2021-02-21T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "D",
                            "memberCode": "012EN001",
                            "name": {
                              "unparsed": "KOHLS/CHASE"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "2222268",
                          "ecoaDesignator": "participant",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": null,
                          "currentBalance": "000000024",
                          "highCredit": "000000456",
                          "creditLimit": 2000,
                          "accountRating": "01",
                          "remark": null,
                          "terms": {
                            "paymentFrequency": null,
                            "paymentScheduleMonthCount": "MIN",
                            "scheduledMonthlyPayment": "000000010"
                          },
                          "account": {
                            "type": "CC"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2021-11-11T00:00:00",
                              "text": "11111111111111111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "23",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2021-12-06T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "D",
                            "memberCode": "01249003",
                            "name": {
                              "unparsed": "RNB-MERVYN"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "2222268",
                          "ecoaDesignator": "jointContractLiability",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": null,
                          "currentBalance": "000000326",
                          "highCredit": "000000622",
                          "creditLimit": 800,
                          "accountRating": "01",
                          "remark": null,
                          "terms": {
                            "paymentFrequency": null,
                            "paymentScheduleMonthCount": "MIN",
                            "scheduledMonthlyPayment": "000000017"
                          },
                          "account": {
                            "type": "CH"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2021-09-06T00:00:00",
                              "text": "111111111111111111111111111111111111111111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "48",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": null,
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "07519027",
                            "name": {
                              "unparsed": "FST USA BK B"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "222221295336",
                          "ecoaDesignator": "individual",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "closedIndicator": "normal",
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000008000",
                          "creditLimit": 8000,
                          "accountRating": "01",
                          "remark": {
                            "code": "CBC",
                            "type": "affiliate"
                          },
                          "terms": null,
                          "account": {
                            "type": "CC"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2021-09-04T00:00:00",
                              "text": "111111111111XXXX111111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "28",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2018-11-30T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "Q",
                            "memberCode": "01607092",
                            "name": {
                              "unparsed": "FOA LEASING"
                            }
                          },
                          "portfolioType": "installment",
                          "accountnumber": "2222209434",
                          "ecoaDesignator": "individual",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "closedIndicator": "normal",
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000005790",
                          "creditLimit": null,
                          "accountRating": "01",
                          "remark": {
                            "code": "CLO",
                            "type": "affiliate"
                          },
                          "terms": {
                            "paymentFrequency": "monthly",
                            "paymentScheduleMonthCount": "024",
                            "scheduledMonthlyPayment": "000000241"
                          },
                          "account": {
                            "type": "LE"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2021-08-11T00:00:00",
                              "text": "X1X111111111111X111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "25",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2021-09-10T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "092WL001",
                            "name": {
                              "unparsed": "HSBC BANK"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "222220032387",
                          "ecoaDesignator": "authorizedUser",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": null,
                          "currentBalance": "000001467",
                          "highCredit": "000001499",
                          "creditLimit": 8000,
                          "accountRating": "01",
                          "remark": null,
                          "terms": {
                            "paymentFrequency": null,
                            "paymentScheduleMonthCount": "MIN",
                            "scheduledMonthlyPayment": "000000030"
                          },
                          "account": {
                            "type": "CC"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2021-07-18T00:00:00",
                              "text": "111111111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "16",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2021-07-02T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "D",
                            "memberCode": "06256397",
                            "name": {
                              "unparsed": "CBUSASEARS"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "222222980",
                          "ecoaDesignator": "individual",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": null,
                          "currentBalance": "000002049",
                          "highCredit": "000002080",
                          "creditLimit": 5300,
                          "accountRating": "01",
                          "remark": null,
                          "terms": {
                            "paymentFrequency": null,
                            "paymentScheduleMonthCount": "MIN",
                            "scheduledMonthlyPayment": "000000049"
                          },
                          "account": {
                            "type": "CH"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2021-06-30T00:00:00",
                              "text": "111111111111111111111111111111111111111111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "48",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": null,
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "H",
                            "memberCode": "01184058",
                            "name": {
                              "unparsed": "CTBK/GARDNER"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "2222223",
                          "ecoaDesignator": "participant",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "currentBalance": "000000000",
                          "highCredit": "000001425",
                          "creditLimit": 4200,
                          "accountRating": "01",
                          "remark": null,
                          "terms": null,
                          "account": null,
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": null,
                            "historicalCounters": null,
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2016-07-06T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "H",
                            "memberCode": "01NZ8007",
                            "name": {
                              "unparsed": "CCB/GRDWHI"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "222227550023",
                          "ecoaDesignator": "participant",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "closedIndicator": "normal",
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000001425",
                          "creditLimit": 4200,
                          "accountRating": "01",
                          "remark": {
                            "code": "CLO",
                            "type": "affiliate"
                          },
                          "terms": null,
                          "account": null,
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": null,
                            "historicalCounters": {
                              "monthsReviewedCount": "48",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2016-08-10T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "F",
                            "memberCode": "03796540",
                            "name": {
                              "unparsed": "FRD MOTOR CR"
                            }
                          },
                          "portfolioType": "installment",
                          "accountnumber": "2222273H28",
                          "ecoaDesignator": "individual",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "closedIndicator": "normal",
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000018409",
                          "creditLimit": null,
                          "accountRating": "01",
                          "remark": null,
                          "terms": {
                            "paymentFrequency": "monthly",
                            "paymentScheduleMonthCount": "060",
                            "scheduledMonthlyPayment": "000000306"
                          },
                          "account": {
                            "type": "AU"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2020-12-31T00:00:00",
                              "text": "X11X11111X1X11X11111X111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "32",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2020-12-06T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "01DTV001",
                            "name": {
                              "unparsed": "CAPITAL ONE"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "222227143840",
                          "ecoaDesignator": "individual",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "closedIndicator": "normal",
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000003915",
                          "creditLimit": null,
                          "accountRating": "01",
                          "remark": {
                            "code": "CBC",
                            "type": "affiliate"
                          },
                          "terms": null,
                          "account": {
                            "type": "CC"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2020-11-15T00:00:00",
                              "text": "1111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "10",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2020-06-03T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "0624P004",
                            "name": {
                              "unparsed": "ABN-AMRO"
                            }
                          },
                          "portfolioType": "mortgage",
                          "accountnumber": "2222210027233",
                          "ecoaDesignator": "jointContractLiability",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "closedIndicator": "normal",
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000100900",
                          "creditLimit": null,
                          "accountRating": "01",
                          "remark": {
                            "code": "CLO",
                            "type": "affiliate"
                          },
                          "terms": {
                            "paymentFrequency": "monthly",
                            "paymentScheduleMonthCount": "360",
                            "scheduledMonthlyPayment": "000000881"
                          },
                          "account": {
                            "type": "CV"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2020-06-01T00:00:00",
                              "text": "111X111111111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "19",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2020-06-13T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "0517R022",
                            "name": {
                              "unparsed": "FLEET CC"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "222229004200",
                          "ecoaDesignator": "authorizedUser",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "closedIndicator": "normal",
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000008000",
                          "creditLimit": 8000,
                          "accountRating": "01",
                          "remark": {
                            "code": "CLO",
                            "type": "affiliate"
                          },
                          "terms": null,
                          "account": {
                            "type": "CC"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2020-04-07T00:00:00",
                              "text": "111111111111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "18",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2018-08-09T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "0402D017",
                            "name": {
                              "unparsed": "CHASE NA"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "222220010119",
                          "ecoaDesignator": "individual",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "closedIndicator": "normal",
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": null,
                          "creditLimit": 4500,
                          "accountRating": "01",
                          "remark": {
                            "code": "CLO",
                            "type": "affiliate"
                          },
                          "terms": null,
                          "account": {
                            "type": "CC"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2019-11-17T00:00:00",
                              "text": "111111111111X1111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "19",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2018-08-08T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "01DTV001",
                            "name": {
                              "unparsed": "CAPITAL ONE"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "222224129347",
                          "ecoaDesignator": "jointContractLiability",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "closedIndicator": "normal",
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000005199",
                          "creditLimit": null,
                          "accountRating": "01",
                          "remark": {
                            "code": "CBC",
                            "type": "affiliate"
                          },
                          "terms": null,
                          "account": {
                            "type": "CC"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2019-11-16T00:00:00",
                              "text": "111111X1XX11111X11XX111111111X11XX1"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "46",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2019-03-16T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "0624P004",
                            "name": {
                              "unparsed": "ABN-AMRO"
                            }
                          },
                          "portfolioType": "mortgage",
                          "accountnumber": "22222763886",
                          "ecoaDesignator": "individual",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "closedIndicator": "normal",
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000079900",
                          "creditLimit": null,
                          "accountRating": "01",
                          "remark": {
                            "code": "CLO",
                            "type": "affiliate"
                          },
                          "terms": {
                            "paymentFrequency": "monthly",
                            "paymentScheduleMonthCount": "360",
                            "scheduledMonthlyPayment": "000000786"
                          },
                          "account": {
                            "type": "CV"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2018-10-18T00:00:00",
                              "text": "X1111111111111111111X1111111111X1111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "42",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2018-11-30T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "062SV017",
                            "name": {
                              "unparsed": "FOA BK"
                            }
                          },
                          "portfolioType": "installment",
                          "accountnumber": "22222971312276369",
                          "ecoaDesignator": "individual",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "closedIndicator": "normal",
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000005895",
                          "creditLimit": null,
                          "accountRating": "01",
                          "remark": {
                            "code": "CLO",
                            "type": "affiliate"
                          },
                          "terms": {
                            "paymentFrequency": "monthly",
                            "paymentScheduleMonthCount": "048",
                            "scheduledMonthlyPayment": null
                          },
                          "account": {
                            "type": "AU"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2018-07-19T00:00:00",
                              "text": "X111111X111111111X1111111X111X1X1XX1111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "39",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2018-08-11T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "D",
                            "memberCode": "0590S008",
                            "name": {
                              "unparsed": "RNB-FIELD1"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "22222529",
                          "ecoaDesignator": "participant",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "currentBalance": "000000000",
                          "highCredit": "000001800",
                          "creditLimit": 1800,
                          "accountRating": "01",
                          "remark": {
                            "code": "CBC",
                            "type": "affiliate"
                          },
                          "terms": null,
                          "account": null,
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": null,
                            "historicalCounters": {
                              "monthsReviewedCount": "12",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2017-04-21T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "D",
                            "memberCode": "06476004",
                            "name": {
                              "unparsed": "TARGET N.B."
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "22222529",
                          "ecoaDesignator": "participant",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "currentBalance": "000000000",
                          "highCredit": "000000800",
                          "creditLimit": 800,
                          "accountRating": "01",
                          "remark": {
                            "code": "CBC",
                            "type": "affiliate"
                          },
                          "terms": null,
                          "account": null,
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": null,
                            "historicalCounters": {
                              "monthsReviewedCount": "12",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2017-04-17T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "062SV017",
                            "name": {
                              "unparsed": "FOA BK"
                            }
                          },
                          "portfolioType": "installment",
                          "accountnumber": "22222972061358607",
                          "ecoaDesignator": "individual",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "closedIndicator": "normal",
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000006361",
                          "creditLimit": null,
                          "accountRating": "01",
                          "remark": {
                            "code": "CLO",
                            "type": "affiliate"
                          },
                          "terms": {
                            "paymentFrequency": "monthly",
                            "paymentScheduleMonthCount": "048",
                            "scheduledMonthlyPayment": "000000163"
                          },
                          "account": {
                            "type": "AU"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2018-04-06T00:00:00",
                              "text": "X111X111111111X1111111X11"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "25",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2018-05-31T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "0517R022",
                            "name": {
                              "unparsed": "FLEET CC"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "222229002207",
                          "ecoaDesignator": "jointContractLiability",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "closedIndicator": "normal",
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": null,
                          "creditLimit": 6000,
                          "accountRating": "01",
                          "remark": {
                            "code": "CLO",
                            "type": "affiliate"
                          },
                          "terms": null,
                          "account": {
                            "type": "CC"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": null,
                            "historicalCounters": {
                              "monthsReviewedCount": "02",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": null,
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "09202010",
                            "name": {
                              "unparsed": "CHEVY CHASE"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "222225200441",
                          "ecoaDesignator": "jointContractLiability",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "closedIndicator": "normal",
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000002366",
                          "creditLimit": 12800,
                          "accountRating": "01",
                          "remark": {
                            "code": "CLO",
                            "type": "affiliate"
                          },
                          "terms": null,
                          "account": {
                            "type": "CC"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2018-02-12T00:00:00",
                              "text": "111111111111111111111111111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "33",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2017-04-19T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "D",
                            "memberCode": "01972010",
                            "name": {
                              "unparsed": "JCP-MCCBG"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "22222833",
                          "ecoaDesignator": "jointContractLiability",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000000710",
                          "creditLimit": null,
                          "accountRating": "01",
                          "remark": {
                            "code": "CBC",
                            "type": "affiliate"
                          },
                          "terms": null,
                          "account": null,
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2017-03-17T00:00:00",
                              "text": "11111111111111111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "23",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": null,
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "H",
                            "memberCode": "085TR001",
                            "name": {
                              "unparsed": "BNB/GW"
                            }
                          },
                          "portfolioType": "installment",
                          "accountnumber": "2222275500230818",
                          "ecoaDesignator": "participant",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "closedIndicator": "normal",
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000001425",
                          "creditLimit": null,
                          "accountRating": "01",
                          "remark": null,
                          "terms": {
                            "paymentFrequency": "monthly",
                            "paymentScheduleMonthCount": "010",
                            "scheduledMonthlyPayment": null
                          },
                          "account": {
                            "type": "CO"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2016-09-10T00:00:00",
                              "text": "1111111111111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "19",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2016-08-07T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "0211Q002",
                            "name": {
                              "unparsed": "HUNTNGTON BK"
                            }
                          },
                          "portfolioType": "installment",
                          "accountnumber": "222229300489",
                          "ecoaDesignator": "individual",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "currentBalance": "000000000",
                          "highCredit": "000006658",
                          "creditLimit": null,
                          "accountRating": "01",
                          "remark": null,
                          "terms": {
                            "paymentFrequency": "monthly",
                            "paymentScheduleMonthCount": "042",
                            "scheduledMonthlyPayment": "000000204"
                          },
                          "account": {
                            "type": "AU"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": null,
                            "historicalCounters": null,
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": null,
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "B",
                            "memberCode": "064DB003",
                            "name": {
                              "unparsed": "CITI"
                            }
                          },
                          "portfolioType": "revolving",
                          "accountnumber": "222220225238",
                          "ecoaDesignator": "individual",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": null,
                          "closedIndicator": null,
                          "datePaidOut": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "currentBalance": "000000000",
                          "highCredit": null,
                          "creditLimit": null,
                          "accountRating": "01",
                          "remark": null,
                          "terms": null,
                          "account": {
                            "type": "CC"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": null,
                            "historicalCounters": null,
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2012-09-12T00:00:00"
                          },
                          "updateMethod": "manual"
                        },
                        {
                          "subscriber": {
                            "industryCode": "F",
                            "memberCode": "0624C151",
                            "name": {
                              "unparsed": "CHRYSLR FIN"
                            }
                          },
                          "portfolioType": "installment",
                          "accountnumber": "2222257898",
                          "ecoaDesignator": "individual",
                          "dateOpened": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateEffective": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "dateClosed": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "0001-01-01T00:00:00"
                          },
                          "closedIndicator": "normal",
                          "datePaidOut": null,
                          "currentBalance": "000000000",
                          "highCredit": "000015988",
                          "creditLimit": null,
                          "accountRating": "UR",
                          "remark": {
                            "code": "CLO",
                            "type": "affiliate"
                          },
                          "terms": {
                            "paymentFrequency": "monthly",
                            "paymentScheduleMonthCount": "061",
                            "scheduledMonthlyPayment": null
                          },
                          "account": {
                            "type": "AU"
                          },
                          "pastDue": "000000000",
                          "paymentHistory": {
                            "paymentPattern": {
                              "startDate": "2016-03-30T00:00:00",
                              "text": "11111111111"
                            },
                            "historicalCounters": {
                              "monthsReviewedCount": "11",
                              "late30DaysTotal": "00",
                              "late60DaysTotal": "00",
                              "late90DaysTotal": "00"
                            },
                            "maxDelinquency": null
                          },
                          "mostRecentPayment": {
                            "date": "2016-04-18T00:00:00"
                          },
                          "updateMethod": "manual"
                        }
                      ],
                      "inquiry": [
                        {
                          "ecoaDesignator": "individual",
                          "subscriber": {
                            "industryCode": "F",
                            "memberCode": "05082333",
                            "inquirySubscriberPrefixCode": "06TR",
                            "name": {
                              "unparsed": "WELCOME TECH"
                            }
                          },
                          "accountType": null,
                          "date": {
                            "estimatedDay": false,
                            "estimatedMonth": false,
                            "estimatedCentury": false,
                            "estimatedYear": false,
                            "value": "2022-04-29T00:00:00"
                          },
                          "requestor": null
                        }
                      ],
                      "publicRecord": null,
                      "collection": []
                    }
                  },
                  "addOnProduct": [
                    {
                      "code": "06500",
                      "status": "delivered",
                      "idMismatchAlert": null,
                      "scoreModel": null,
                      "ofacNameScreen": null,
                      "militaryLendingActSearch": null,
                      "highRiskFraudAlert": {
                        "message": {
                          "source": "input",
                          "code": "3008"
                        },
                        "identificationIssuance": [
                          {
                            "source": "input",
                            "type": "ssn",
                            "alertMessageCode": "5504",
                            "yearRange": {
                              "startYear": 1992,
                              "endYear": 1992
                            },
                            "state": "NM",
                            "ageObtained": {
                              "rangeStart": "+00",
                              "rangeEnd": "+00"
                            }
                          },
                          {
                            "source": "file",
                            "type": "ssn",
                            "alertMessageCode": "5504",
                            "yearRange": {
                              "startYear": 1992,
                              "endYear": 1992
                            },
                            "state": "NM",
                            "ageObtained": {
                              "rangeStart": "-07",
                              "rangeEnd": "-06"
                            }
                          }
                        ]
                      }
                    },
                    {
                      "code": "001NN",
                      "status": "defaultDelivered",
                      "idMismatchAlert": null,
                      "scoreModel": {
                        "score": {
                          "results": "+782",
                          "derogatoryAlert": false,
                          "fileInquiriesImpactedScore": false,
                          "factors": {
                            "factor": [
                              {
                                "rank": 1,
                                "code": "64",
                                "description": null
                              },
                              {
                                "rank": 2,
                                "code": "49",
                                "description": null
                              },
                              {
                                "rank": 3,
                                "code": "65",
                                "description": null
                              },
                              {
                                "rank": 4,
                                "code": "28",
                                "description": null
                              }
                            ]
                          },
                          "scoreCard": "07"
                        },
                        "characteristic": null
                      },
                      "ofacNameScreen": null,
                      "militaryLendingActSearch": null,
                      "highRiskFraudAlert": null
                    },
                    {
                      "code": "00Y70",
                      "status": "defaultDelivered",
                      "idMismatchAlert": null,
                      "scoreModel": {
                        "score": null,
                        "characteristic": {
                          "algorithmID": "00Y70",
                          "id": "CVVTG4RR",
                          "value": "067"
                        }
                      },
                      "ofacNameScreen": null,
                      "militaryLendingActSearch": null,
                      "highRiskFraudAlert": null
                    },
                    {
                      "code": "06800",
                      "status": "defaultDelivered",
                      "idMismatchAlert": null,
                      "scoreModel": null,
                      "ofacNameScreen": {
                        "searchStatus": "clear"
                      },
                      "militaryLendingActSearch": null,
                      "highRiskFraudAlert": null
                    },
                    {
                      "code": "07051",
                      "status": "delivered",
                      "idMismatchAlert": null,
                      "scoreModel": null,
                      "ofacNameScreen": null,
                      "militaryLendingActSearch": {
                        "searchStatus": "noMatch"
                      },
                      "highRiskFraudAlert": null
                    }
                  ]
                }
              },
              "error": null
            },
            "document": "response",
            "version": "2.21",
            "transactionControl": {
              "userRefNumber": "1",
              "subscriber": {
                "industryCode": "F",
                "memberCode": "F5082333",
                "inquirySubscriberPrefixCode": "0622"
              },
              "options": {
                "country": "us",
                "language": "en",
                "productVersion": "standard"
              },
              "tracking": {
                "transactionTimeStamp": "2022-04-29T13:09:28.941+00:00"
              }
            }
          },
          "score": "+782",
          "socialSecurity": "666603693",
          "status": 0,
          "trade": [
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "08737114",
                "name": {
                  "unparsed": "COMERICA BK"
                }
              },
              "portfolioType": "installment",
              "accountnumber": "222229142476341",
              "ecoaDesignator": "jointContractLiability",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000016000",
              "creditLimit": null,
              "accountRating": "01",
              "remark": null,
              "terms": {
                "paymentFrequency": "monthly",
                "paymentScheduleMonthCount": "120",
                "scheduledMonthlyPayment": "000000235"
              },
              "account": {
                "type": "HI"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": null,
                "historicalCounters": null,
                "maxDelinquency": null
              },
              "mostRecentPayment": null,
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "06330016",
                "name": {
                  "unparsed": "PEOPLES UNTD"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "222229010041",
              "ecoaDesignator": "jointContractLiability",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "closedIndicator": "normal",
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000002738",
              "creditLimit": 5800,
              "accountRating": "01",
              "remark": {
                "code": "CBC",
                "type": "affiliate"
              },
              "terms": null,
              "account": {
                "type": "CC"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2022-02-08T00:00:00",
                  "text": "111111111111111111111111111111111111111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "46",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": null,
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "07991190",
                "name": {
                  "unparsed": "HSBC BANK"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "222225425002",
              "ecoaDesignator": "jointContractLiability",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "currentBalance": "000000000",
              "highCredit": "000005229",
              "creditLimit": 11000,
              "accountRating": "01",
              "remark": null,
              "terms": null,
              "account": {
                "type": "CC"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2022-01-10T00:00:00",
                  "text": "11111111111111111111111X111111111111111111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "48",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2022-01-10T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "0235197E",
                "name": {
                  "unparsed": "HSBC/RS"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "22222001567",
              "ecoaDesignator": "individual",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000000687",
              "creditLimit": null,
              "accountRating": "01",
              "remark": {
                "code": "CBC",
                "type": "affiliate"
              },
              "terms": null,
              "account": {
                "type": "CH"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2022-01-09T00:00:00",
                  "text": "111111111111111111111111111111111111111111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "48",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2022-01-09T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "0640N038",
                "name": {
                  "unparsed": "AMER GEN FIN"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "222226500546",
              "ecoaDesignator": "individual",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": null,
              "currentBalance": "000001181",
              "highCredit": "000005000",
              "creditLimit": 5000,
              "accountRating": "01",
              "remark": null,
              "terms": null,
              "account": {
                "type": "CH"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2022-01-08T00:00:00",
                  "text": "1111111X1"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "09",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": null,
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "01LFG001",
                "name": {
                  "unparsed": "PROVDN BNP"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "2382305235",
              "ecoaDesignator": "individual",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000000000",
              "creditLimit": 5000,
              "accountRating": "01",
              "remark": null,
              "terms": null,
              "account": {
                "type": "CC"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": null,
                "historicalCounters": null,
                "maxDelinquency": null
              },
              "mostRecentPayment": null,
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "D",
                "memberCode": "0235008G",
                "name": {
                  "unparsed": "GEMB/M WARD"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "2222242",
              "ecoaDesignator": "participant",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": null,
              "currentBalance": "000000199",
              "highCredit": "000002785",
              "creditLimit": 5000,
              "accountRating": "01",
              "remark": null,
              "terms": null,
              "account": null,
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2021-12-17T00:00:00",
                  "text": "111111111111111111111111111111111111111111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "48",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2022-01-11T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "F",
                "memberCode": "0338S003",
                "name": {
                  "unparsed": "WASH MTG CO"
                }
              },
              "portfolioType": "mortgage",
              "accountnumber": "2222212",
              "ecoaDesignator": "jointContractLiability",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": null,
              "currentBalance": "000116317",
              "highCredit": "000118000",
              "creditLimit": null,
              "accountRating": "01",
              "remark": null,
              "terms": {
                "paymentFrequency": "monthly",
                "paymentScheduleMonthCount": "360",
                "scheduledMonthlyPayment": "000000928"
              },
              "account": {
                "type": "CV"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2021-12-14T00:00:00",
                  "text": "11111111111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "17",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2022-01-08T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "F",
                "memberCode": "01W2N002",
                "name": {
                  "unparsed": "CONTINENTAL"
                }
              },
              "portfolioType": "installment",
              "accountnumber": "22222166717641001",
              "ecoaDesignator": "individual",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": null,
              "currentBalance": "000013211",
              "highCredit": "000015646",
              "creditLimit": null,
              "accountRating": "01",
              "remark": null,
              "terms": {
                "paymentFrequency": "monthly",
                "paymentScheduleMonthCount": "066",
                "scheduledMonthlyPayment": "000000309"
              },
              "account": {
                "type": "AU"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2021-12-13T00:00:00",
                  "text": "111111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "12",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2022-01-07T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "F",
                "memberCode": "01W2N002",
                "name": {
                  "unparsed": "CONTINENTAL"
                }
              },
              "portfolioType": "installment",
              "accountnumber": "22222167456951001",
              "ecoaDesignator": "individual",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": null,
              "currentBalance": "000012753",
              "highCredit": "000013375",
              "creditLimit": null,
              "accountRating": "01",
              "remark": null,
              "terms": {
                "paymentFrequency": "monthly",
                "paymentScheduleMonthCount": "066",
                "scheduledMonthlyPayment": "000000260"
              },
              "account": {
                "type": "AU"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2021-12-10T00:00:00",
                  "text": "111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "03",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2022-01-05T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "0348D153",
                "name": {
                  "unparsed": "JPMCB HOME"
                }
              },
              "portfolioType": "installment",
              "accountnumber": "22222220000176077",
              "ecoaDesignator": "jointContractLiability",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": null,
              "currentBalance": "000018000",
              "highCredit": "000018000",
              "creditLimit": null,
              "accountRating": "01",
              "remark": null,
              "terms": {
                "paymentFrequency": "monthly",
                "paymentScheduleMonthCount": "084",
                "scheduledMonthlyPayment": "000000281"
              },
              "account": {
                "type": "SE"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": null,
                "historicalCounters": null,
                "maxDelinquency": null
              },
              "mostRecentPayment": null,
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "0152B021",
                "name": {
                  "unparsed": "SPIEGEL"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "222229",
              "ecoaDesignator": "authorizedUser",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": null,
              "currentBalance": "000000033",
              "highCredit": "000006700",
              "creditLimit": 6700,
              "accountRating": "01",
              "remark": null,
              "terms": {
                "paymentFrequency": null,
                "paymentScheduleMonthCount": "MIN",
                "scheduledMonthlyPayment": "000000015"
              },
              "account": {
                "type": "CH"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2021-11-18T00:00:00",
                  "text": "1111111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "48",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2021-02-21T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "D",
                "memberCode": "012EN001",
                "name": {
                  "unparsed": "KOHLS/CHASE"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "2222268",
              "ecoaDesignator": "participant",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": null,
              "currentBalance": "000000024",
              "highCredit": "000000456",
              "creditLimit": 2000,
              "accountRating": "01",
              "remark": null,
              "terms": {
                "paymentFrequency": null,
                "paymentScheduleMonthCount": "MIN",
                "scheduledMonthlyPayment": "000000010"
              },
              "account": {
                "type": "CC"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2021-11-11T00:00:00",
                  "text": "11111111111111111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "23",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2021-12-06T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "D",
                "memberCode": "01249003",
                "name": {
                  "unparsed": "RNB-MERVYN"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "2222268",
              "ecoaDesignator": "jointContractLiability",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": null,
              "currentBalance": "000000326",
              "highCredit": "000000622",
              "creditLimit": 800,
              "accountRating": "01",
              "remark": null,
              "terms": {
                "paymentFrequency": null,
                "paymentScheduleMonthCount": "MIN",
                "scheduledMonthlyPayment": "000000017"
              },
              "account": {
                "type": "CH"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2021-09-06T00:00:00",
                  "text": "111111111111111111111111111111111111111111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "48",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": null,
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "07519027",
                "name": {
                  "unparsed": "FST USA BK B"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "222221295336",
              "ecoaDesignator": "individual",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "closedIndicator": "normal",
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000008000",
              "creditLimit": 8000,
              "accountRating": "01",
              "remark": {
                "code": "CBC",
                "type": "affiliate"
              },
              "terms": null,
              "account": {
                "type": "CC"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2021-09-04T00:00:00",
                  "text": "111111111111XXXX111111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "28",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2018-11-30T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "Q",
                "memberCode": "01607092",
                "name": {
                  "unparsed": "FOA LEASING"
                }
              },
              "portfolioType": "installment",
              "accountnumber": "2222209434",
              "ecoaDesignator": "individual",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "closedIndicator": "normal",
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000005790",
              "creditLimit": null,
              "accountRating": "01",
              "remark": {
                "code": "CLO",
                "type": "affiliate"
              },
              "terms": {
                "paymentFrequency": "monthly",
                "paymentScheduleMonthCount": "024",
                "scheduledMonthlyPayment": "000000241"
              },
              "account": {
                "type": "LE"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2021-08-11T00:00:00",
                  "text": "X1X111111111111X111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "25",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2021-09-10T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "092WL001",
                "name": {
                  "unparsed": "HSBC BANK"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "222220032387",
              "ecoaDesignator": "authorizedUser",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": null,
              "currentBalance": "000001467",
              "highCredit": "000001499",
              "creditLimit": 8000,
              "accountRating": "01",
              "remark": null,
              "terms": {
                "paymentFrequency": null,
                "paymentScheduleMonthCount": "MIN",
                "scheduledMonthlyPayment": "000000030"
              },
              "account": {
                "type": "CC"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2021-07-18T00:00:00",
                  "text": "111111111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "16",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2021-07-02T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "D",
                "memberCode": "06256397",
                "name": {
                  "unparsed": "CBUSASEARS"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "222222980",
              "ecoaDesignator": "individual",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": null,
              "currentBalance": "000002049",
              "highCredit": "000002080",
              "creditLimit": 5300,
              "accountRating": "01",
              "remark": null,
              "terms": {
                "paymentFrequency": null,
                "paymentScheduleMonthCount": "MIN",
                "scheduledMonthlyPayment": "000000049"
              },
              "account": {
                "type": "CH"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2021-06-30T00:00:00",
                  "text": "111111111111111111111111111111111111111111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "48",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": null,
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "H",
                "memberCode": "01184058",
                "name": {
                  "unparsed": "CTBK/GARDNER"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "2222223",
              "ecoaDesignator": "participant",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "currentBalance": "000000000",
              "highCredit": "000001425",
              "creditLimit": 4200,
              "accountRating": "01",
              "remark": null,
              "terms": null,
              "account": null,
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": null,
                "historicalCounters": null,
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2016-07-06T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "H",
                "memberCode": "01NZ8007",
                "name": {
                  "unparsed": "CCB/GRDWHI"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "222227550023",
              "ecoaDesignator": "participant",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "closedIndicator": "normal",
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000001425",
              "creditLimit": 4200,
              "accountRating": "01",
              "remark": {
                "code": "CLO",
                "type": "affiliate"
              },
              "terms": null,
              "account": null,
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": null,
                "historicalCounters": {
                  "monthsReviewedCount": "48",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2016-08-10T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "F",
                "memberCode": "03796540",
                "name": {
                  "unparsed": "FRD MOTOR CR"
                }
              },
              "portfolioType": "installment",
              "accountnumber": "2222273H28",
              "ecoaDesignator": "individual",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "closedIndicator": "normal",
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000018409",
              "creditLimit": null,
              "accountRating": "01",
              "remark": null,
              "terms": {
                "paymentFrequency": "monthly",
                "paymentScheduleMonthCount": "060",
                "scheduledMonthlyPayment": "000000306"
              },
              "account": {
                "type": "AU"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2020-12-31T00:00:00",
                  "text": "X11X11111X1X11X11111X111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "32",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2020-12-06T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "01DTV001",
                "name": {
                  "unparsed": "CAPITAL ONE"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "222227143840",
              "ecoaDesignator": "individual",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "closedIndicator": "normal",
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000003915",
              "creditLimit": null,
              "accountRating": "01",
              "remark": {
                "code": "CBC",
                "type": "affiliate"
              },
              "terms": null,
              "account": {
                "type": "CC"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2020-11-15T00:00:00",
                  "text": "1111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "10",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2020-06-03T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "0624P004",
                "name": {
                  "unparsed": "ABN-AMRO"
                }
              },
              "portfolioType": "mortgage",
              "accountnumber": "2222210027233",
              "ecoaDesignator": "jointContractLiability",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "closedIndicator": "normal",
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000100900",
              "creditLimit": null,
              "accountRating": "01",
              "remark": {
                "code": "CLO",
                "type": "affiliate"
              },
              "terms": {
                "paymentFrequency": "monthly",
                "paymentScheduleMonthCount": "360",
                "scheduledMonthlyPayment": "000000881"
              },
              "account": {
                "type": "CV"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2020-06-01T00:00:00",
                  "text": "111X111111111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "19",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2020-06-13T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "0517R022",
                "name": {
                  "unparsed": "FLEET CC"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "222229004200",
              "ecoaDesignator": "authorizedUser",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "closedIndicator": "normal",
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000008000",
              "creditLimit": 8000,
              "accountRating": "01",
              "remark": {
                "code": "CLO",
                "type": "affiliate"
              },
              "terms": null,
              "account": {
                "type": "CC"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2020-04-07T00:00:00",
                  "text": "111111111111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "18",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2018-08-09T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "0402D017",
                "name": {
                  "unparsed": "CHASE NA"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "222220010119",
              "ecoaDesignator": "individual",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "closedIndicator": "normal",
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": null,
              "creditLimit": 4500,
              "accountRating": "01",
              "remark": {
                "code": "CLO",
                "type": "affiliate"
              },
              "terms": null,
              "account": {
                "type": "CC"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2019-11-17T00:00:00",
                  "text": "111111111111X1111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "19",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2018-08-08T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "01DTV001",
                "name": {
                  "unparsed": "CAPITAL ONE"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "222224129347",
              "ecoaDesignator": "jointContractLiability",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "closedIndicator": "normal",
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000005199",
              "creditLimit": null,
              "accountRating": "01",
              "remark": {
                "code": "CBC",
                "type": "affiliate"
              },
              "terms": null,
              "account": {
                "type": "CC"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2019-11-16T00:00:00",
                  "text": "111111X1XX11111X11XX111111111X11XX1"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "46",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2019-03-16T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "0624P004",
                "name": {
                  "unparsed": "ABN-AMRO"
                }
              },
              "portfolioType": "mortgage",
              "accountnumber": "22222763886",
              "ecoaDesignator": "individual",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "closedIndicator": "normal",
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000079900",
              "creditLimit": null,
              "accountRating": "01",
              "remark": {
                "code": "CLO",
                "type": "affiliate"
              },
              "terms": {
                "paymentFrequency": "monthly",
                "paymentScheduleMonthCount": "360",
                "scheduledMonthlyPayment": "000000786"
              },
              "account": {
                "type": "CV"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2018-10-18T00:00:00",
                  "text": "X1111111111111111111X1111111111X1111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "42",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2018-11-30T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "062SV017",
                "name": {
                  "unparsed": "FOA BK"
                }
              },
              "portfolioType": "installment",
              "accountnumber": "22222971312276369",
              "ecoaDesignator": "individual",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "closedIndicator": "normal",
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000005895",
              "creditLimit": null,
              "accountRating": "01",
              "remark": {
                "code": "CLO",
                "type": "affiliate"
              },
              "terms": {
                "paymentFrequency": "monthly",
                "paymentScheduleMonthCount": "048",
                "scheduledMonthlyPayment": null
              },
              "account": {
                "type": "AU"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2018-07-19T00:00:00",
                  "text": "X111111X111111111X1111111X111X1X1XX1111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "39",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2018-08-11T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "D",
                "memberCode": "0590S008",
                "name": {
                  "unparsed": "RNB-FIELD1"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "22222529",
              "ecoaDesignator": "participant",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "currentBalance": "000000000",
              "highCredit": "000001800",
              "creditLimit": 1800,
              "accountRating": "01",
              "remark": {
                "code": "CBC",
                "type": "affiliate"
              },
              "terms": null,
              "account": null,
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": null,
                "historicalCounters": {
                  "monthsReviewedCount": "12",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2017-04-21T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "D",
                "memberCode": "06476004",
                "name": {
                  "unparsed": "TARGET N.B."
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "22222529",
              "ecoaDesignator": "participant",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "currentBalance": "000000000",
              "highCredit": "000000800",
              "creditLimit": 800,
              "accountRating": "01",
              "remark": {
                "code": "CBC",
                "type": "affiliate"
              },
              "terms": null,
              "account": null,
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": null,
                "historicalCounters": {
                  "monthsReviewedCount": "12",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2017-04-17T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "062SV017",
                "name": {
                  "unparsed": "FOA BK"
                }
              },
              "portfolioType": "installment",
              "accountnumber": "22222972061358607",
              "ecoaDesignator": "individual",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "closedIndicator": "normal",
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000006361",
              "creditLimit": null,
              "accountRating": "01",
              "remark": {
                "code": "CLO",
                "type": "affiliate"
              },
              "terms": {
                "paymentFrequency": "monthly",
                "paymentScheduleMonthCount": "048",
                "scheduledMonthlyPayment": "000000163"
              },
              "account": {
                "type": "AU"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2018-04-06T00:00:00",
                  "text": "X111X111111111X1111111X11"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "25",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2018-05-31T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "0517R022",
                "name": {
                  "unparsed": "FLEET CC"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "222229002207",
              "ecoaDesignator": "jointContractLiability",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "closedIndicator": "normal",
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": null,
              "creditLimit": 6000,
              "accountRating": "01",
              "remark": {
                "code": "CLO",
                "type": "affiliate"
              },
              "terms": null,
              "account": {
                "type": "CC"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": null,
                "historicalCounters": {
                  "monthsReviewedCount": "02",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": null,
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "09202010",
                "name": {
                  "unparsed": "CHEVY CHASE"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "222225200441",
              "ecoaDesignator": "jointContractLiability",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "closedIndicator": "normal",
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000002366",
              "creditLimit": 12800,
              "accountRating": "01",
              "remark": {
                "code": "CLO",
                "type": "affiliate"
              },
              "terms": null,
              "account": {
                "type": "CC"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2018-02-12T00:00:00",
                  "text": "111111111111111111111111111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "33",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2017-04-19T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "D",
                "memberCode": "01972010",
                "name": {
                  "unparsed": "JCP-MCCBG"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "22222833",
              "ecoaDesignator": "jointContractLiability",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000000710",
              "creditLimit": null,
              "accountRating": "01",
              "remark": {
                "code": "CBC",
                "type": "affiliate"
              },
              "terms": null,
              "account": null,
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2017-03-17T00:00:00",
                  "text": "11111111111111111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "23",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": null,
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "H",
                "memberCode": "085TR001",
                "name": {
                  "unparsed": "BNB/GW"
                }
              },
              "portfolioType": "installment",
              "accountnumber": "2222275500230818",
              "ecoaDesignator": "participant",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "closedIndicator": "normal",
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000001425",
              "creditLimit": null,
              "accountRating": "01",
              "remark": null,
              "terms": {
                "paymentFrequency": "monthly",
                "paymentScheduleMonthCount": "010",
                "scheduledMonthlyPayment": null
              },
              "account": {
                "type": "CO"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2016-09-10T00:00:00",
                  "text": "1111111111111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "19",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2016-08-07T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "0211Q002",
                "name": {
                  "unparsed": "HUNTNGTON BK"
                }
              },
              "portfolioType": "installment",
              "accountnumber": "222229300489",
              "ecoaDesignator": "individual",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "currentBalance": "000000000",
              "highCredit": "000006658",
              "creditLimit": null,
              "accountRating": "01",
              "remark": null,
              "terms": {
                "paymentFrequency": "monthly",
                "paymentScheduleMonthCount": "042",
                "scheduledMonthlyPayment": "000000204"
              },
              "account": {
                "type": "AU"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": null,
                "historicalCounters": null,
                "maxDelinquency": null
              },
              "mostRecentPayment": null,
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "B",
                "memberCode": "064DB003",
                "name": {
                  "unparsed": "CITI"
                }
              },
              "portfolioType": "revolving",
              "accountnumber": "222220225238",
              "ecoaDesignator": "individual",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": null,
              "closedIndicator": null,
              "datePaidOut": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "currentBalance": "000000000",
              "highCredit": null,
              "creditLimit": null,
              "accountRating": "01",
              "remark": null,
              "terms": null,
              "account": {
                "type": "CC"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": null,
                "historicalCounters": null,
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2012-09-12T00:00:00"
              },
              "updateMethod": "manual"
            },
            {
              "subscriber": {
                "industryCode": "F",
                "memberCode": "0624C151",
                "name": {
                  "unparsed": "CHRYSLR FIN"
                }
              },
              "portfolioType": "installment",
              "accountnumber": "2222257898",
              "ecoaDesignator": "individual",
              "dateOpened": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateEffective": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "dateClosed": {
                "estimatedDay": false,
                "estimatedMonth": false,
                "estimatedCentury": false,
                "estimatedYear": false,
                "value": "0001-01-01T00:00:00"
              },
              "closedIndicator": "normal",
              "datePaidOut": null,
              "currentBalance": "000000000",
              "highCredit": "000015988",
              "creditLimit": null,
              "accountRating": "UR",
              "remark": {
                "code": "CLO",
                "type": "affiliate"
              },
              "terms": {
                "paymentFrequency": "monthly",
                "paymentScheduleMonthCount": "061",
                "scheduledMonthlyPayment": null
              },
              "account": {
                "type": "AU"
              },
              "pastDue": "000000000",
              "paymentHistory": {
                "paymentPattern": {
                  "startDate": "2016-03-30T00:00:00",
                  "text": "11111111111"
                },
                "historicalCounters": {
                  "monthsReviewedCount": "11",
                  "late30DaysTotal": "00",
                  "late60DaysTotal": "00",
                  "late90DaysTotal": "00"
                },
                "maxDelinquency": null
              },
              "mostRecentPayment": {
                "date": "2016-04-18T00:00:00"
              },
              "updateMethod": "manual"
            }
          ],
          "collection": [],
          "user": "1"
        },
        "transUnionHistory": null,
        "loanOffersResponse": {
          "status": "Declined",
          "rulesCount": 13,
          "passRules": [
            "R3: Number of revolving trade lines < 0",
            "R5: BK in last 24 mos >  0",
            "R6: Foreclosure in last 24 mos >  0",
            "R7: public records in last 24 months >  5",
            "R8: #Of trades with #60+DPD in past 24 months >  4",
            "R9: #Of trades with #60+DPD in past 6 months  > 2",
            "R10: Utilization of Revolving trades > 0",
            "R11: Minimum Credit Score < 450",
            "R12: ISA Shares income exeeds percent  >  0",
            "R14: Number of Derogatory Active Trades > 3",
            "R15: Combination Rule R7+R14 > 5",
            "R16: FXI Score > 20"
          ],
          "failRules": [
            "R13: Minimum Specified Monthly Income <= 1500"
          ],
          "bankPassRules": [
            "BTR1: Average income in 6 months  < 600",
            "BTR2: NSF transactions in a month  > 0",
            "BTR3: NSF transactions in 3 months  > 600",
            "BTR4: Average balance in 6 months  < 400",
            "BTR5: Current balance  < 200",
            "BTR6: Balance from all depository bank accounts  < 11",
            "BTR7: Average balance from depository accounts in 3 months  < 200",
            "BTR8: Total income in 6 months  < 1000",
            "BTR9: Days since oldest transaction  > 100",
            "BTR10: Average most recent available balance  < -1000",
            "BTR11: Ratio of time in days from primary checking account having no activity  > 10",
            "BTR12: Total spending related transactions in the past 30 days  < 500",
            "BTR13: Total payment related transaction in past 3 months  < 90",
            "BTR14: Total ATM fee related transactions in the past 3 months   > 1000"
          ],
          "bankFailRules": [],
          "aprs": [
            {
              "gradeId": 63,
              "settingId": 32,
              "minScore": 680,
              "maxScore": 850,
              "apr": 17.97
            },
            {
              "gradeId": 63,
              "settingId": 32,
              "minScore": 680,
              "maxScore": 850,
              "apr": 13.97
            },
            {
              "gradeId": 63,
              "settingId": 32,
              "minScore": 680,
              "maxScore": 850,
              "apr": 23.97
            },
            {
              "gradeId": 63,
              "settingId": 32,
              "minScore": 680,
              "maxScore": 850,
              "apr": 21.97
            }
          ],
          "offers": [
            {
              "finalRequestedLoanAmount": 0,
              "financedAmount": 0,
              "fullNumberAmount": 0,
              "interestFeeAmount": 0,
              "interestRate": 0,
              "loanamount": 0,
              "loanGrade": "3300",
              "offerType": "3900",
              "offerValue": "3200",
              "maxCreditScore": 850,
              "minCreditSCore": 680,
              "maxDTI": 40,
              "minDTI": 30,
              "maximumAmount": 120000,
              "minimumAmount": 0,
              "fundingRate": 0,
              "salesPrice": 0,
              "totalLoanAmount": 0
            }
          ],
          "terms": [
            {
              "termDuration": "10",
              "termDescription": "Term 10",
              "gradeDescription": "3300",
              "monthlypayment": 0,
              "maxMonthlyPayment": 0
            },
            {
              "termDuration": "15",
              "termDescription": "Term 15",
              "gradeDescription": "3300",
              "monthlypayment": 0,
              "maxMonthlyPayment": 0
            },
            {
              "termDuration": "18",
              "termDescription": "Term 18",
              "gradeDescription": "3300",
              "monthlypayment": 0,
              "maxMonthlyPayment": 0
            },
            {
              "termDuration": "24",
              "termDescription": "Term 24",
              "gradeDescription": "3300",
              "monthlypayment": 0,
              "maxMonthlyPayment": 0
            }
          ],
          "requestedloanamount": 0,
          "message": "Offers retrieved."
        }
      };

      let senddata = {
        "creditReport": JSON.stringify(credit_report['transUnion']),
        "income": 2000,
        "settingId": 32,
        "bankRules": [
          
        ],
        "creditScore": credit_report['creditScore']
      }
      

      let rules:any = {};
	//rule e_r_1  
	let income_list = ['PAYROLL',
		'ANNUITY',
		'DIRECT DEP',
		'DIRECT DEPOSIT',
		'DIRECT DEP',
		'DIRDEP',
		'DIRÂ DEP',
		'DIR DEP',
		'DIRECT DEP',
		'SALARY',
		'PAYCHECK',
		'BRANCH DEPOSIT INCOME',
		'ATM DEPOSIT INCOME',
		'MOBILE DEPOSIT INCOME',
		'BRANCH DEPOSIT WITH HOLD INCOME',
		'INCOME - PAYCHECK',
		'PROMOTION BONUS',
		'ALLOWANCE',
		'DIVIDEND'
	];

	let exclude_list = ['BANKING PAYMENT',
		'ONLINE PAYMENT',
		'CREDIT CARD PAYMENT'
	];

	let category_list = ['Tax|Refund', 'Transfer|Payroll', 'Transfer|Payroll|Benefits'];

	let income_6mon_amount = 0;
	let income_6mon_avg;
      transaction.forEach(transaction => {
        let trans_since_app = moment().diff(moment(transaction.date), 'months', true);
				let trans_name = transaction.name.toUpperCase();
				//let trans_description = transaction.original_description.toUpperCase();
				let trans_category = transaction.category;

				if (transaction.amount < -5 && trans_since_app <= 6 &&
					((category_list.includes(trans_category) == true && exclude_list.includes(trans_name) == false)
						|| (income_list.includes(trans_name)))) {
					income_6mon_amount += parseFloat(transaction.amount);
				}
      });

      income_6mon_avg = income_6mon_amount / 6;
      rules.btr1 = { passed: income_6mon_avg < 600 ? false : true, value: income_6mon_avg.toFixed(2) };
      senddata.bankRules.push({
        "ruleName": "btr1",
        "ruleValue": +rules.btr1.value
      })
      // rule e_r_1: if income_6mon_avg < 2000  then e_r_1 = 1 else e_r_1  = 0;

      let NSF_list = ['OVERDRAFT', 'INSUFFICIENT', ' OD FEE', ' NSF'];
      let overdraft_list = ['Bank Fees, Insufficient Funds', 'Bank Fees, Overdraft'];

      // rule e_r_2

	let nsf_in_1m_cnt = 0;
	transaction.forEach(transaction => {
				let trans_since_app = moment().diff(moment(transaction.date), 'months', true);
				let trans_name = transaction.name.toUpperCase();
				//let trans_description = transaction.original_description.toUpperCase();
				let trans_category = transaction.category;

				if (transaction.amount > 0 && trans_since_app <= 1 &&
					(NSF_list.includes(trans_name) == true || overdraft_list.indexOf(trans_category) > -1)) {
					nsf_in_1m_cnt += 1;

				}
			})

	  // e_r_2: if nsf_in_1m_cnt > 0  then e_r_2 = 1 else e_r_2 = 0;
	rules.btr2 = { passed: nsf_in_1m_cnt > 0 ? false : true, value: nsf_in_1m_cnt.toFixed(2) };
  senddata.bankRules.push({
    "ruleName": "btr2",
    "ruleValue": +rules.btr2.value
  })
  //rule e_r_3
	let nsf_in_3m_cnt = 0;
	transaction.forEach(transaction => {
				let trans_since_app = moment().diff(moment(transaction.date), 'months', true);
				let trans_name = transaction.name.toUpperCase();
				//let trans_description = transaction.original_description.toUpperCase();
				let trans_category = transaction.category;

				if (transaction.amount > 0 && trans_since_app <= 3 &&
					(NSF_list.includes(trans_name) == true || overdraft_list.indexOf(trans_category) > -1)) {
					nsf_in_3m_cnt += 1;

				}
		
	});    // e_r_3: if nsf_in_3m_cnt > 2  then e_r_3 = 1 else e_r_3 = 0;
	rules.btr3 = { passed: nsf_in_3m_cnt > 600 ? false : true, value: nsf_in_3m_cnt.toFixed(2) };
  senddata.bankRules.push({
    "ruleName": "btr3",
    "ruleValue": +rules.btr3.value
  })
	
  // rule e_r_4
	let avg_depository_6mon = 0;
	let depository_6mon_cnt = 0;
	let depository_6mon_amt = 0;

 
	balance.forEach(balance => {
				let bal_since_app = moment().diff(moment(balance.date), 'months', true);

        if (bal_since_app <= 6) {
          depository_6mon_amt += parseFloat(balance.amount);
          depository_6mon_cnt += 1;
        }
		
	});

  avg_depository_6mon = depository_6mon_amt / depository_6mon_cnt;
	rules.btr4 = { passed: avg_depository_6mon < 400 ? false : true, value: (!Number.isNaN(avg_depository_6mon) ? avg_depository_6mon.toFixed(2) : 0.00) };
	// e_r_4: if avg_depository_6mon <= 400 then e_r_4 = 1 else e_r_4 = 0;
  senddata.bankRules.push({
    "ruleName": "btr4",
    "ruleValue": +rules.btr4.value
  })
  // rule e_r_5
	let bal_avail_depository = 0;
  bankaccount.forEach(bankaccount => {
    if (bankaccount.type == "depository") {

      bal_avail_depository += parseFloat(bankaccount.available);

    }
  });
	
   // e_r_5: if e_r_5 <= 200 then e_r_5 = 1 else e_r_5 = 0;
	rules.btr5 = { passed: bal_avail_depository < 200 ? false : true, value: (!Number.isNaN(bal_avail_depository) ? bal_avail_depository.toFixed(2) : 0.00) };
  senddata.bankRules.push({
    "ruleName": "btr5",
    "ruleValue": +rules.btr5.value
  })

  	//rule mh_r_1

	let positive_days_depository_1mon = 0;
  bankaccount.forEach(bankaccount => {
    if (bankaccount.type == "depository") {
      balance.forEach(balance => {
        if(bankaccount.id==balance.bankaccountid){
        let bal_since_app = moment().diff(moment(balance.date), 'months', true);
        if (bal_since_app <= 1 && balance.amount > 0) {

          positive_days_depository_1mon += 1;

        }
      }
      })
    }
  })

	//mh_r_1: if bal_avail_depository < 50 && bal_avail_depository is not missing && positive_days_depository_1mon < 20 && 
	// positive_days_depository_1mon is not missing then mh_r_1 = 1 else mh_r_1 = 0;
	rules.btr6 = { passed: bal_avail_depository > 11  ? false : true, value: (!Number.isNaN(bal_avail_depository) ? bal_avail_depository.toFixed(2) : 0.00) };
  senddata.bankRules.push({
    "ruleName": "btr6",
    "ruleValue": +rules.btr6.value
  })
  	// rule mh_r_2

	let avg_depository_3mon = 0;
	let depository_3mon_cnt = 0;
	let depository_3mon_amt = 0;

	bankaccount.forEach(bankaccount => {
    if (bankaccount.type == "depository") {
      balance.forEach(balance => {
        if(bankaccount.id==balance.bankaccountid){

					let bal_since_app = moment().diff(moment(balance.date), 'months', true);

					if (bal_since_app <= 3) {

						depository_3mon_amt += parseFloat(balance.amount);
						depository_3mon_cnt += 1;
					}
        }
			
		})
  }
	});

	avg_depository_3mon = depository_3mon_amt / depository_3mon_cnt;

	let avg_credit_3mon = 0;
	let credit_3mon_cnt = 0;
	let credit_3mon_amt = 0;

  bankaccount.forEach(bankaccount => {
    if (bankaccount.type == "depository") {
      balance.forEach(balance => {
        if(bankaccount.id==balance.bankaccountid){

					let bal_since_app = moment().diff(moment(balance.date), 'months', true);

					if (bal_since_app <= 3) {

						credit_3mon_amt += parseFloat(balance.current);
						credit_3mon_cnt += 1;
					}
        }
			
		})
  }
	});

	avg_credit_3mon = credit_3mon_amt / credit_3mon_cnt;

	//mh_r_2: if avg_depository_3mon < 200 && avg_depository_3mon is not missing && avg_credit_3mon > 500 &&
	// avg_credit_3mon is not missing then mh_r_2 = 1 else mh_r_2 = 0;

	rules.btr7 = { passed: avg_depository_3mon < 200  ? false : true, value: (!Number.isNaN(avg_depository_3mon) ? avg_depository_3mon.toFixed(2) : 0.00) };
  senddata.bankRules.push({
    "ruleName": "btr7",
    "ruleValue": +rules.btr7.value
  })
	// rule mh_r_3
	// if income_6mon_amount < 1000 && income_6mon_amount is not missing then mh_r_3 = 1 else mh_r_3 = 0;
	rules.btr8 = { passed: income_6mon_amount < 1000 ? false : true, value: income_6mon_amount.toFixed(2) };
  senddata.bankRules.push({
    "ruleName": "btr8",
    "ruleValue": +rules.btr8.value
  })
  // rule mh_r_4
	var trans_dates = [];
	var days_since_old_trans;

	transaction.forEach(transaction => {

				trans_dates.push(transaction.date);

			})



	
	try {
		let max_trans_date = trans_dates.reduce(function (a, b) { return a < b ? a : b; }); // find the oldest date
		days_since_old_trans = moment().diff(moment(max_trans_date), 'days', true);
	} catch (e) {
		days_since_old_trans = 0;
	}

	let pdl_list = ['RISE DE II DB',
		'ONE MAIN FINANCIAL',
		'ONE MAIN PAY',
		'CREDITBOX',
		'RSVP LOANS',
		'ELASTIC',
		'PLAIN GREEN',
		'AMPLIFY',
		'CASHNETUSA',
		'SPEEDY',
		'AUTOSAVE PAYDAY',
		'SC CAROLINA PAYDAY',
		'CASHBACK PAYDAY',
		'USA PAYDAY',
		'REAL PAYDAY LOAN',
		'GULF PAYDAY',
		'PAYDAY MONEY CENTERS',
		'FAST PAYDAY LOAN',
		'SOUTHERN PAYDAY',
		'PAYDAYHAWAII',
		'PAYDAY24NOW',
		'PAYDAY MONEY STORE',
		'PAYDAY ONE',
		'PAYDAY LOAN STORE',
		'PAYDAY EXP',
		'CASH ADVANCE',
		'MONEYKEY',
		'BLUE TRUST',
		'ACE CASH EXPRESS',
		'CHECK INTO CASH',
		'CHECK CITY',
		'MONEYLION',
		'CASH CENTRAL',
		'CHECK N GO',
		'MONEY TREE',
		'LENDUP',
		'ADVANCE AMERICA',
		'MOBILOANS',
		'LOANME',
		'OPPORTUNITY FINA',
		'CREDITNINJA',
		'FIG LOAN',
		'BIG PICTURE LOAN',
		'500FASTCASH',
		'WALLACE',
		'CHECK ADVANCE USA',
		'CASH FACTORY',
		'POWER FINANCE',
		'ARROWHEAD'
	];

	let deposit_1mon_amt = 0;
	transaction.forEach(transaction => {

				let trans_since_app = moment().diff(moment(transaction.date), 'months', true);
				let trans_name = transaction.name.toUpperCase();

				if (transaction.amount < -5 && trans_since_app <= 1 && pdl_list.includes(trans_name) ) {

					deposit_1mon_amt += parseFloat(transaction.amount);
				}
			})


	//mh_r_4: if days_since_old_trans < 180 && days_since_old_trans is not missing && deposit_1mon_amt < -500 && deposit_1mon_amt is not missing then mh_r_4 = 1 else mh_r_4 = 0;
	console.warn('btr9', (days_since_old_trans < 180 && days_since_old_trans && deposit_1mon_amt < -500 && deposit_1mon_amt))
	rules.btr9 = { passed: days_since_old_trans < 100  ? false : true, value: days_since_old_trans.toFixed(2) };
  senddata.bankRules.push({
    "ruleName": "btr9",
    "ruleValue": +rules.btr9.value
  })
  // rule g_r_1
	let ck_acc_bal_avg = 0;
	let ck_acc_bal_sum;
	let ck_acc_bal_cnt;


	bankaccount.forEach(bankaccount => {
			if (bankaccount.type == "checking") {

				ck_acc_bal_sum += parseFloat(bankaccount.available);
				ck_acc_bal_cnt += 1;
			}
    
		});


	ck_acc_bal_avg = ck_acc_bal_sum / ck_acc_bal_cnt;
	//g_r_1: if ck_acc_bal_avg is missing or ck_acc_bal_avg <-1000 then g_r_1 =1 else g_r_1 = 0;
	rules.btr10 = { passed:  ck_acc_bal_avg < -1000 ? false : true, value: (!Number.isNaN(ck_acc_bal_avg) ? ck_acc_bal_avg.toFixed(2) : 0.00) };
  senddata.bankRules.push({
    "ruleName": "btr10",
    "ruleValue": +rules.btr10.value
  })
	// rule g_r_3

	let payment_amt_90d = 0;

	transaction.forEach(transaction => {
       
				let category = Math.floor(parseFloat((Number(transaction.category_id)/ 1000000).toString())); // eg: cast 17018000 into 17
				let trans_since_app = moment().diff(moment(transaction.date), 'days', true);

				if (category == 16 && trans_since_app <= 90) {
					payment_amt_90d += transaction.amount;

				}
			})

		    //g_r_3: if payment_amt_90d <50 and payment_amt_90d is not missing then g_r_3 = 1 else g_r_3 = 0;
	rules.btr11 = { passed: payment_amt_90d < 10 ? false : true, value: payment_amt_90d.toFixed(2) };
  senddata.bankRules.push({
    "ruleName": "btr11",
    "ruleValue": +rules.btr11.value
  })
  // rule g_r_4

	let spd_pos_cnt_30d = 0;
	let spd_list = [12, 13, 14, 17, 18, 19, 22];

  transaction.forEach(transaction => {

				let category = Math.floor(parseFloat((Number(transaction.category_id)/ 1000000).toString()));  // eg: cast 17018000 into 17
				let trans_since_app = moment().diff(moment(transaction.date), 'days', true);

				if (spd_list.includes(category) == true && trans_since_app <= 30 && transaction.amount > 0) {
					spd_pos_cnt_30d += 1;

				}
			})

  //spd_pos_cnt_30d: if spd_pos_cnt_30d <3 or spd_pos_cnt_30d is missing then rule g_r_4 = 1 else rule g_r_4 = 0;
	rules.btr12 = { passed: spd_pos_cnt_30d < 500 ? false : true, value: spd_pos_cnt_30d.toFixed(2) };
  senddata.bankRules.push({
    "ruleName": "btr12",
    "ruleValue": +rules.btr12.value
  })
	// rule g_r_5

	let bkf_cnt_90d = 0;
	let bkf_amt_90d = 0;

	transaction.forEach(transaction => {

				let category = Math.floor(parseFloat((Number(transaction.category_id)/ 1000000).toString())); // eg: cast 17018000 into 17
				let trans_since_app = moment().diff(moment(transaction.date), 'days', true);

				if (category == 10 && trans_since_app <= 90) {
					bkf_cnt_90d += 1;
					bkf_amt_90d += transaction.amount;

				}
			})

  //g_r_5: if bkf_cnt_90d <20 or bkf_amt_90d > 1000 then rule g_r_5 = 1 else rule g_r_5 = 0;
	rules.btr13 = { passed: bkf_cnt_90d < 50 ? false : true, value: bkf_cnt_90d.toFixed(2) };
  senddata.bankRules.push({
    "ruleName": "btr13",
    "ruleValue": +rules.btr13.value
  })
	// rule g_r_6

	let checking1_gap_max_pct = 0;
	var dict = {};
	let trans_max_gap = 0;
	let trans_length = 0;
	let trans_cnt = 0;
	let trans_list = [];
	let checking_cnt = 0;

  bankaccount.forEach(bankaccount => {
    if (bankaccount.type == "checking") {
      transaction.forEach(transaction => {
        if(bankaccount.id==transaction.bankaccountid){
					trans_list.push(transaction.date);
        }
				})

				let trans_list_sort = trans_list.sort(function (a, b) { return b - a }) // sort dates list in a descending way
				trans_cnt = trans_list.length;
				trans_length = moment(trans_list_sort[0]).diff(moment(trans_list_sort[-1]), 'days', true); // get longest days difference from transaction dates
				// define a function getMax to find maximum days between two transaction dates (next to each other) in array trans_list_sort
				// eg: ['2021-1-9','2021-1-7','2021-1-4','2021-1-3','2021-1-1'] will return 3 days
				trans_max_gap = 90;
				checking1_gap_max_pct = trans_max_gap / trans_length; // round to 2 decimal

				checking_cnt += 1;
				dict['checking_' + checking_cnt.toString()] = [trans_cnt, checking1_gap_max_pct]; // skip the duplicate trans_length
			}

		})


	for (let m in dict) {

		// find the largest trans_cnt, then return the cresponding checking1_gap_max_pct

	};
	rules.btr14 = { passed: checking1_gap_max_pct > 1000 ? false : true, value: checking1_gap_max_pct.toFixed(2) };
  senddata.bankRules.push({
    "ruleName": "btr14",
    "ruleValue": +rules.btr14.value
  })
	//g_r_6: if checking1_gap_max_pct > 0.1 then g_r_6 = 1 else g_r_6 = 0;
	
  const data1 = await this.httpService
  .post(
    process.env.creditreport + 'api/Decision/refreshRules',
    senddata,
  )
  .toPromise();
let res = data1.data;
      return { statusCode: 200, data: res };
  } catch (error) {
    console.log(error.response)
    return {      
      statusCode: 500,
      message: [new InternalServerErrorException(error)['response']['name']],
      error: 'Bad Request',
    };
  }
  }

  async getbankUserInfo(id) {
    try {
      const entityManager = getManager();
      let useraccount = await entityManager.query(`select t.* from plaidaccesstokenmaster t where t.loan_id = '${id}' `);
      return { statusCode: 200, data: useraccount };
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
