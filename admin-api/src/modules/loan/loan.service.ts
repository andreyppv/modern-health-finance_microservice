import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/users.entity';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'src/repository/users.repository';
import { ContactInfoDto } from './dto/contactInfo.dto';
import { CustomerRepository } from 'src/repository/customer.repository';
import { CustomerEntity } from 'src/entities/customer.entity';
import { LogEntity } from 'src/entities/log.entity';
import { Loan } from '../../entities/loan.entity';
import { EntityManager, getManager } from 'typeorm';
import { LoanRepository } from 'src/repository/loan.repository';
import { LogRepository } from 'src/repository/log.repository';
import { PersonalInfoDto } from './dto/personalInfo.dto';
import { EmploymentInfoDto } from './dto/employmentInfo.dto';
import { PlaidDto } from './dto/plaid.dto';
import { CommonService } from 'src/service/common/common.service';
import { signature, VerifyEmailDto } from './dto/create-loan.dto';
import { commonService } from 'src/common/helper-service';
import { userConsentEnity } from '../../entities/userConsent.entity';
import { UserConsentRepository } from 'src/repository/userConsent.repository';
import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  CountryCode,
  Products,
  ItemPublicTokenExchangeRequest,
  InstitutionsGetByIdRequest,
  IdentityGetRequest,
  TransactionsGetRequest,
  AssetReportGetRequest,
} from 'plaid';
const fs = require('fs');
import { BankAccounts, Flags } from 'src/entities/bankAccount.entity';
import { BankAccountsRepository } from 'src/repository/bankAccount.repository';
import { BankTransactions } from 'src/entities/bankTransaction.entity';
import { PlaidAccessTokenMaster } from 'src/entities/plaidAccessTokenMaster.entity';
import { PlaidAccessTokenMasterRepository } from 'src/repository/plaidAccessTokenMaster.repository';
import { BankTransactionsRepository } from 'src/repository/bankTransaction.repository';
import {
  LoanOffersEntity,
  offerTypeFlags,
  Flags as offerFlags,
} from 'src/entities/loanOffers.entity';
import { LoanOffersRepository } from 'src/repository/loanOffers.repository';
import { ElligibleOffer } from './dto/loanamount.dto';
import { PaymentscheduleEntity } from '../../entities/paymentschedule.entity';
import { PaymentscheduleRepository } from '../../repository/paymentschedule.repository';
import { StatusFlags } from '../../entities/loan.entity';
import { get } from 'https';
import { MailService } from '../../mail/mail.service';
import { promissoryNote } from '../loan/promissory-note.service';
import { EditEmailDto } from './dto/update-email.dto';
import { EditPhonenumDto } from './dto/update-phonenum.dto';
import { CreditreportRepository } from 'src/repository/creditreport.repository';
import { HttpService } from '@nestjs/axios';
import { Creditreport } from 'src/entities/creditreport.entity';
import { CostExplorer } from 'aws-sdk';
import path from 'path';
import { minLength } from 'class-validator';
import { HistoricalBalanceEntity } from 'src/entities/historicalBalance.entity';
import { HistoricalBalanaceRepository } from 'src/repository/historicalBalance.repository';

@Injectable()
export class LoanService {
  public plaidConfig: any;

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
    @InjectRepository(BankAccountsRepository)
    private readonly bankAccountsRepository: BankAccountsRepository,
    @InjectRepository(BankTransactionsRepository)
    private readonly bankTransactionsRepository: BankTransactionsRepository,
    @InjectRepository(PlaidAccessTokenMasterRepository)
    private readonly plaidAccessTokenMasterRepository: PlaidAccessTokenMasterRepository,
    private readonly commonService: CommonService,
    @InjectRepository(LoanOffersRepository)
    private readonly loanOffersRepository: LoanOffersRepository,
    @InjectRepository(UserConsentRepository)
    private readonly userConsentRepository: UserConsentRepository,
    @InjectRepository(PaymentscheduleRepository)
    private readonly paymentScheduleRepository: PaymentscheduleRepository,
    private readonly mailService: MailService,
    private readonly promissoryNote: promissoryNote,
    private httpService: HttpService,
    @InjectRepository(CreditreportRepository)
    private readonly creditreportRepository: CreditreportRepository,
    @InjectRepository(HistoricalBalanaceRepository) private readonly historicalBalanceRepository:HistoricalBalanaceRepository
  ) {
    this.plaidConfig = {
      basePath: PlaidEnvironments[process.env.PLAID_EVE],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENTID,
          'PLAID-SECRET': process.env.PLAIND_SECRETKEY,
        },
      },
    };
  }
  async getloanDetailsByLoanId(loan_id) {
    try {
      const entityManager = getManager();

      let rawData = await entityManager.query(`select * from customer cus
        join practice pra on pra.id = cus."practiceid"
        join user user1 on user1.id = cus.user_id
        where cus.loan_id = '${loan_id}'`);
      console.log(rawData);
      if (rawData.length > 0) {
        return { statusCode: 200, data: rawData };
      } else {
        return { statusCode: 400, message: 'Loan Id does not exist!!!' };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async getPromissoryNoteData(loan_id) {
    const entityManager = getManager();
    try {
      let html = await this.promissoryNote.getHtmlData(loan_id);
      console.log(html);
      console.log(this.promissoryNote.data.userDetails)
      console.log(this.promissoryNote.data.paymentDetails)
      return {
        statusCode: 200,
        data: html,
        userDetails: this.promissoryNote.data.userDetails,
        paymentDetails: this.promissoryNote.data.paymentDetails,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async savePromissoryNote(loan_id, signature: signature) {
    let createPromissoryNoteDto = signature.signatures[0];
    try {
      this.triggerMail(loan_id);
      const currentDate = new Date();
      // await this.loanRepository.update(
      //   { id: loan_id },
      //   {
      //     signature: createPromissoryNoteDto.signature,
      //     date: currentDate,
      //   },
      // );

      // await this.customerRepository.update(
      //   { loan_id: loan_id },
      //   {
      //     signature: createPromissoryNoteDto.signature,
      //   },
      // );

    //  let signedHTML = await this.getHtmlDataWithSign(loan_id);
    //   const cs = new commonService(this.logRepository);
    //   const fileName = 'PromissoryNote.pdf';
      // const promissoryNote = await cs.convertHTMLToPDF(
      //   loan_id,
      //   signedHTML.data,
      //   fileName,
      // );
      // const promissoryNote = await cs.convertHTMLToPDF(
      //     loan_id,
      //      signedHTML.data,
      //      fileName,
      //    );

      const consentEntity = new userConsentEnity();

      // if (
      //   Object.keys(promissoryNote).length > 0 &&
      //   promissoryNote.Location != undefined
      // ) {
      //   consentEntity.loanid = loan_id;
      //   consentEntity.filekey = 105;
      //   consentEntity.filepath = promissoryNote.key;
      // }
      // const entityManager = getManager();
      // await entityManager.save(consentEntity);

      // await this.loanRepository.update(
      //   { id: loan_id },
      //   { lastscreen: 'review', step: 7 },
      // );
      console.log(210);
      return {
        statusCode: 200,
        data: "promissoryNote"
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async saveUserConsent(saveData: any) {
    try {
      const responseData = await this.userConsentRepository.save(saveData);
      return responseData;
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async getstage(loan_id) {
    try {
      const entityManager = getManager();

      let rawData = await entityManager.query(
        `select user_id,"lastscreen", step from loan where delete_flag = 'N'and id='${loan_id}'`,
      );
      if (rawData.length > 0) {
        return { statusCode: 200, data: rawData };
      } else {
        return { statusCode: 400, message: 'Loan Id does not exist!!!' };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async addContanctInfo(contactInfoDto: ContactInfoDto, ip) {
    let customerEntity = new CustomerEntity();
    let userEntity = new UserEntity();
    userEntity.role = '2';
    const entityManager = getManager();
    const user = await entityManager.query(`select * from "user" where email='${contactInfoDto.email}'`);

    if (user.length>0) { 
      return {
        statusCode: 400,
        message: 'Email already exist',
        error: 'Bad Request',
      };
    
    }
    if (contactInfoDto.firstname.trim().length == 0) {
      return {
        statusCode: 400,
        message: 'First Name should not be empty',
        error: 'Bad Request',
      };
    } else {
      userEntity.firstname = contactInfoDto.firstname;
      customerEntity.firstname = contactInfoDto.firstname;
    }

    userEntity.middlename = contactInfoDto.middlename;
    customerEntity.middlename = contactInfoDto.middlename;

    if (contactInfoDto.lastname.trim().length == 0) {
      return {
        statusCode: 400,
        message: 'Last Name should not be empty',
        error: 'Bad Request',
      };
    } else {
      userEntity.lastname = contactInfoDto.lastname;
      customerEntity.lastname = contactInfoDto.lastname;
    }

    if (contactInfoDto.email.trim().length == 0) {
      return {
        statusCode: 400,
        message: 'Email Name should not be empty',
        error: 'Bad Request',
      };
    } else {
      userEntity.email = contactInfoDto.email;
      customerEntity.email = contactInfoDto.email;
    }

    if (contactInfoDto.phone.trim().length == 0) {
      return {
        statusCode: 400,
        message: 'phone should not be empty',
        error: 'Bad Request',
      };
    } else {
      customerEntity.phone = contactInfoDto.phone;
    }

    if (contactInfoDto.password.trim().length == 0) {
      return {
        statusCode: 400,
        message: 'Password should not be empty',
        error: 'Bad Request',
      };
    } else {
      let password = contactInfoDto.password;
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);
      userEntity.salt = salt;
      userEntity.password = hashPassword;
    }

    if (contactInfoDto.practiceid.trim().length == 0) {
      return {
        statusCode: 400,
        message: 'practiceId should not be empty',
        error: 'Bad Request',
      };
    } else {
      customerEntity.practiceid = contactInfoDto.practiceid;
    }
    // userEntity.active_flag = Flags.Y;
    
    let userid = await this.userRepository.save(userEntity);
    console.log('ssssssssssssssssssssss');
    console.log(userid.role);
   // console.log(loanid)
   // let loanid_remove_dash = loanid.replace(/-/gi, "");
   // userEntity._id = loanid_remove_dash;
    
    let tempuser = await entityManager.query(`select * from "user" where email='${contactInfoDto.email}'`);
    
    console.log(tempuser);
    let loanid = tempuser[0].id;
    console.log(loanid);
    let loanid_remove_dash = loanid.replace(/-/gi, "");
    console.log(loanid_remove_dash);
    // await this.loanRepository.update(
    //   { id: loan_id },
    //   { lastscreen: 'review', step: 7 },
    // );

    await this.userRepository.update(
      { id: loanid },
      { _id: loanid_remove_dash},
    );
    
    

    // let loanEntity = new Loan();
    
    // loanEntity.user_id = userid._id;
    
    // loanEntity.email = userid.email;
    
    // loanEntity.lastscreen = 'Your Contact Information';
    // loanEntity.step = 2;
    // let loan_id = await this.loanRepository.save(loanEntity);
    // customerEntity.loan_id = loan_id.id;
    // customerEntity.user_id = userid._id;

    // await this.customerRepository.save(customerEntity);

    // let log = new LogEntity();
    // log.module = 'Your Information Updated. IP : ' + ip;
    // log.user_id = userid._id;
    // log.loan_id = loan_id.id;
    // await this.logRepository.save(log);
    console.log("okk")
    return {
      statusCode: [200],
      message: ['success'],
      loan_id: loanid,
    };
  }

  async getHtmlDataWithSign(loan_id) {
    const entityManager = getManager();
    try {
      let html = await this.promissoryNote.getHtmlData(loan_id);
      let customersignature = await entityManager.query(`select * from customer where loan_id = '${loan_id}'
      `);
      let borrowerSign = new RegExp(`{[(]{Signature0}[)]}`, 'g');

      html = html.replace(borrowerSign, customersignature[0].signature);

      return {
        statusCode: 200,
        data: html,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async mailTriggeringForPromissoryNote(loan_id) {
    const entityManager = getManager();
    try {
      let customerDetails = await entityManager.query(
        `SELECT "email" FROM customer where loan_id = '${loan_id}' and "isPrimary"='Y'
        `,
      );
      await this.mailService.initial_note(
        customerDetails[0].email,
        process.env.AdminUrl + 'promissory-note/' + loan_id,
      );
      return {
        statusCode: 200,
        data: 'Promissory Note Sent Successfully',
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async updatePersonalInfo(loan_id, personalInfoDto: PersonalInfoDto, ip) {
    const {
      streetaddress,
      unit,
      city,
      state,
      zipcode,
      birthday,
      socialsecuritynumber,
      monthlyMortgage,
      monthlyincome,
      typeofresidence,
      isagree,
    } = personalInfoDto;
    if (streetaddress && typeof streetaddress == 'string') {
      if (streetaddress.trim().length == 0) {
        return {
          statusCode: 400,
          message: ['streetAddress should not be empty'],
          error: 'Bad Request',
        };
      }
    } else {
      return {
        statusCode: 400,
        message: ['streetAddress should not be empty'],
        error: 'Bad Request',
      };
    }
    if (city && typeof city == 'string') {
      if (city.trim().length == 0) {
        return {
          statusCode: 400,
          message: ['lastName should not be empty'],
          error: 'Bad Request',
        };
      }
    } else {
      return {
        statusCode: 400,
        message: ['lastName should not be empty'],
        error: 'Bad Request',
      };
    }
    if (state && typeof state == 'string') {
      if (state.trim().length == 0) {
        return {
          statusCode: 400,
          message: ['state should not be empty'],
          error: 'Bad Request',
        };
      }
    } else {
      return {
        statusCode: 400,
        message: ['state should not be empty'],
        error: 'Bad Request',
      };
    }

    if (unit && typeof unit == 'string') {
      if (unit.trim().length == 0) {
        return {
          statusCode: 400,
          message: ['unit should not be empty'],
          error: 'Bad Request',
        };
      }
    } else {
      return {
        statusCode: 400,
        message: ['unit should not be empty'],
        error: 'Bad Request',
      };
    }
    if (zipcode && typeof zipcode == 'string') {
      if (zipcode.trim().length == 0) {
        return {
          statusCode: 400,
          message: ['zipCode should not be empty'],
          error: 'Bad Request',
        };
      }
    } else {
      return {
        statusCode: 400,
        message: ['zipCode should not be empty'],
        error: 'Bad Request',
      };
    }

    if (socialsecuritynumber && typeof socialsecuritynumber == 'string') {
      if (socialsecuritynumber.trim().length == 0) {
        return {
          statusCode: 400,
          message: ['socialSecurityNumber should not be empty'],
          error: 'Bad Request',
        };
      }
    } else {
      return {
        statusCode: 400,
        message: ['socialSecurityNumber should not be empty'],
        error: 'Bad Request',
      };
    }
    if (monthlyMortgage && typeof monthlyMortgage == 'number') {
      if (monthlyMortgage == 0) {
        return {
          statusCode: 400,
          message: ['monthlyMortgage should not be 0'],
          error: 'Bad Request',
        };
      }
    } else {
      return {
        statusCode: 400,
        message: ['monthlyMortgage should not be 0'],
        error: 'Bad Request',
      };
    }
    if (state && typeof monthlyincome == 'number') {
      if (monthlyincome == 0) {
        return {
          statusCode: 400,
          message: ['monthlyIncome should not be 0'],
          error: 'Bad Request',
        };
      }
    } else {
      return {
        statusCode: 400,
        message: ['monthlyIncome should not be 0'],
        error: 'Bad Request',
      };
    }
    if (typeofresidence && typeof typeofresidence == 'string') {
      if (typeofresidence.trim().length == 0) {
        return {
          statusCode: 400,
          message: ['typeOfResidence should not be empty'],
          error: 'Bad Request',
        };
      }
    } else {
      return {
        statusCode: 400,
        message: ['typeOfResidence should not be empty'],
        error: 'Bad Request',
      };
    }
    if (isagree && typeof isagree == 'boolean') {
      if ((personalInfoDto.isagree = false)) {
        return {
          statusCode: 400,
          message: ['Kindly agree the policies'],
          error: 'Bad Request',
        };
      }
    } else {
      return {
        statusCode: 400,
        message: ['confirmation should not be empty'],
        error: 'Bad Request',
      };
    }
    try {
      const entityManager = getManager();
      // let lograwData = await entityManager.query(
      //   `select user_id from loan where delete_flag ='N'and step=2 and id='${loan_id}'`,
      // );
     // if (lograwData.length > 0) {
      if (1) {
        // await this.customerRepository.update(
        //   { loan_id: loan_id },
        //   {
        //     streetaddress: streetaddress,
        //     unit: unit,
        //     city: city,
        //     state: state,
        //     zipcode: zipcode,
        //     socialsecuritynumber: socialsecuritynumber,
        //     birthday: birthday,
        //     monthlyincome: monthlyincome,
        //     mortgagepayment: monthlyMortgage,
        //     typeofresidence: typeofresidence,
        //     annualincome: monthlyincome * 12,
        //   },
        // );
        // await this.loanRepository.update(
        //   { id: loan_id },
        //   { step: 3, lastscreen: 'Your Personal Information' },
        // );
        // let data = await entityManager.query(
        //   `select user_id,step,"lastscreen" from loan where delete_flag='N' and status_flag = 'waiting' and id='${loan_id}'`,
        // );

        let logsdata = [];
        let log = new LogEntity();
        log.module = 'Your Personal Information Updated. IP : ' + ip;
       // log.user_id = data[0]['user_id'];
        log.loan_id = loan_id;
        logsdata.push(log);
       // await this.logRepository.save(logsdata);
        let b = await this.savereport(loan_id);
        // console.log('=========>>>>>>>>>', b);
        return { statusCode: 200, message: ['success'], data: "data" };
      } else {
        return {
          statusCode: 400,
          message: ['Invalid Loan ID'],
          error: 'Bad Request',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async savereport(loan_id) {
    try {
      const entityManager = getManager();
      let borrowerDetails = await entityManager.query(
        `select t.*, t2."practicesettings" as setting_id from customer t 
        join practice t2 on t2.id = t."practiceid"
        where t.loan_id='${loan_id}'`,
      );
      // console.log(borrowerDetails);
      let creditreportReq = {
        hardPull: true,
        id: '',
        firstname: borrowerDetails[0].firstname,
        middlename: '',
        lastname: borrowerDetails[0].firstname,
        dateOfBirth: borrowerDetails[0].birthday,
        address: {
          addressStatus: '',
          houseNumber: '',
          streetName: borrowerDetails[0].streetaddress,
          streetType: '',
          direction: '',
          city: borrowerDetails[0].city,
          state: borrowerDetails[0].state,
          zipcode: borrowerDetails[0].zipcode,
        },
        ssnNumber: borrowerDetails[0].socialsecuritynumber,
        loanamount: 10000,
        settingId: borrowerDetails[0].setting_id,
        bankRules: [
          {
            ruleName: 'btr1',
            ruleValue: 12345,
          },
          {
            ruleName: 'btr2',
            ruleValue: 0,
          },
          {
            ruleName: 'btr3',
            ruleValue: 0,
          },
          {
            ruleName: 'btr4',
            ruleValue: 1200,
          },
          {
            ruleName: 'btr5',
            ruleValue: 500,
          },
          {
            ruleName: 'btr6',
            ruleValue: 10000,
          },
          {
            ruleName: 'btr7',
            ruleValue: 1245,
          },
          {
            ruleName: 'btr8',
            ruleValue: 112345,
          },
          {
            ruleName: 'btr9',
            ruleValue: 1,
          },
          {
            ruleName: 'btr10',
            ruleValue: 1250,
          },
          {
            ruleName: 'btr11',
            ruleValue: 2345,
          },
          {
            ruleName: 'btr12',
            ruleValue: 56,
          },
          {
            ruleName: 'btr13',
            ruleValue: 51,
          },
          {
            ruleName: 'btr14',
            ruleValue: 1111,
          },
        ],
      };
      let logsdata = [];
      let report = new Creditreport();
      report.loan_id = loan_id;
      // console.log(creditreportReq);
      const data1 = await this.httpService
        .post(
          process.env.creditreport + 'api/Decision/approvedOffers',
          creditreportReq,
        )
        .toPromise();
      let res = data1.data;
      // console.log('res=============>', res);
      if (res['status'] == undefined) {
        report.report = JSON.stringify(res);

        await this.saveGeneratedOffers(loan_id, res);

        await this.creditreportRepository.update(
          { loan_id: loan_id },
          { delete_flag: Flags.Y },
        );

        await this.creditreportRepository.save(report);
        let log = new LogEntity();
        log.loan_id = loan_id;
        log.user_id = borrowerDetails[0].user_id;
        log.module = 'Status:Credit Report Pulled';
        logsdata.push(log);
        const rawData = await entityManager.query(
          `select report from creditreport where loan_id = '${loan_id}' and delete_flag='N'`,
        );
        return { statusCode: 200, data: rawData };
      } else {
        let log = new LogEntity();
        log.loan_id = loan_id;
        log.user_id = borrowerDetails[0].user_id;
        log.module = 'Status Failed: Credit Report is invalid.';
        logsdata.push(log);
        return {
          statusCode: 500,
          message: 'Status Failed: Credit Report is invalid.',
          error: 'Bad Request',
        };
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async saveGeneratedOffers(loan_id, res) {
    let offers = res['loanOffersResponse']['offers'];
    let terms = res['loanOffersResponse']['terms'];
    let apr = res['loanOffersResponse']['aprs'];
    console.log('===========?>>>>>>>>>>>>>>>>', { offers, terms, apr });
    console.log('************', offers != undefined);
    if (offers != undefined) {
      let Tlength = terms.length;
      let Alength = apr.length;
      console.log('lenght**********=========>', Tlength, Alength);

      let requiredLength = Math.min(Tlength, Alength);
      console.log('requiredLength', requiredLength);
      for (var i = 0; i < requiredLength; i++) {
        let offersEntity = new LoanOffersEntity();
        let entityManager = getManager();

        offersEntity.loan_id = loan_id;
        offersEntity.financialamount = offers[0].offerValue;
        // console.log('finAmount', offersEntity.financialAmount);
        offersEntity.duration = terms[i].termDuration;
        // console.log('offersEntity.duration', offersEntity.duration);
        offersEntity.interestrate = apr[i].apr;
        offersEntity.fundedrate = offers[0].fundingRate;
        offersEntity.downpayment = offers[0].offerType;
        offersEntity.salesprice = offers[0].salesPrice;
        offersEntity.monthlyamount = this.commonService.findPaymentAmountMonthly(
          offers[0].offerValue,
          apr[i].apr,
          terms[i].termDuration,
        );
        // console.log('offersEntity.interestRate', offersEntity.interestRate);
        let finalresult = await entityManager.save(offersEntity);
        console.log('finalresult', finalresult);
      }
    }
  }
  // Update Employment Information
  async updateEmploymentInfo(
    loan_id,
    employmentInfoDto: EmploymentInfoDto,
    ip,
  ) {
    const {
      employmentStatus,
      employerName,
      employerphone,
      dateofhired,
      jobtitle,
      payrollFreq,
      paymentdate,
    } = employmentInfoDto;

    console.log(854)
    if (employmentStatus && typeof employmentStatus == 'string') {
      if (employmentStatus.trim().length == 0) {
        return {
          statusCode: 400,
          message: ['employmentStatus should not be empty'],
          error: 'Bad Request',
        };
      }
    } else {
      return {
        statusCode: 400,
        message: ['employment status should not be empty'],
        error: 'Bad Request',
      };
    }
    if (employerName && typeof employerName == 'string') {
      if (employerName.trim().length == 0) {
        return {
          statusCode: 400,
          message: ['employer name should not be empty'],
          error: 'Bad Request',
        };
      }
    } else {
      return {
        statusCode: 400,
        message: ['employer name should not be empty'],
        error: 'Bad Request',
      };
    }
    if (employerphone && typeof employerphone == 'string') {
      if (employerphone.trim().length == 0) {
        return {
          statusCode: 400,
          message: ['employerPhone should not be empty'],
          error: 'Bad Request',
        };
      }
    } else {
      return {
        statusCode: 400,
        message: ['employerPhone should not be empty'],
        error: 'Bad Request',
      };
    }

    if (dateofhired && typeof dateofhired == 'string') {
      if (dateofhired.trim().length == 0) {
        return {
          statusCode: 400,
          message: ['dateOfHired should not be empty'],
          error: 'Bad Request',
        };
      }
    } else {
      return {
        statusCode: 400,
        message: ['dateOfHired should not be empty'],
        error: 'Bad Request',
      };
    }

    if (jobtitle && typeof jobtitle == 'string') {
      if (jobtitle.trim().length == 0) {
        return {
          statusCode: 400,
          message: ['jobtitle should not be empty'],
          error: 'Bad Request',
        };
      }
    } else {
      return {
        statusCode: 400,
        message: ['jobtitle should not be empty'],
        error: 'Bad Request',
      };
    }
    if (payrollFreq && typeof payrollFreq == 'string') {
      if (payrollFreq.trim().length == 0) {
        return {
          statusCode: 400,
          message: ['payrollFreq should not be empty'],
          error: 'Bad Request',
        };
      }
    } else {
      return {
        statusCode: 400,
        message: ['payrollFreq should not be empty'],
        error: 'Bad Request',
      };
    }
    if (paymentdate && typeof paymentdate == 'string') {
      if (paymentdate.trim().length == 0) {
        return {
          statusCode: 400,
          message: ['paymentDate should not be empty'],
          error: 'Bad Request',
        };
      }
    } else {
      return {
        statusCode: 400,
        message: ['paymentDate should not be empty'],
        error: 'Bad Request',
      };
    }

    try {
      const entityManager = getManager();
      console.log(966)
      // let rawData = await entityManager.query(
      //   `select user_id from loan where delete_flag = 'N'  and step = 3 and id = '${loan_id}'`,
      // );
      //if (rawData.length > 0) {
      if (1) { 
      // await this.customerRepository.update(
        //   { loan_id: loan_id },
        //   {
        //     workstatus: employmentStatus,
        //     employer: employerName,
        //     employerphone: employerphone,
        //     jobtitle: jobtitle,
        //     payfrequency: payrollFreq,
        //     payment_duedate: paymentdate,
        //     dateofhired: dateofhired,
        //   },
        // );
        // let target = await entityManager.query(
        //   `select user_id from loan where id = '${loan_id}'`,
        // );
        // let user_id = target[0].user_id;

        // await this.loanRepository.update(
        //   { id: loan_id },
        //   { step: 4, lastscreen: 'Your Employment Information' },
        // );
        // let data = await entityManager.query(
        //   `select user_id, step, "lastscreen" from loan where delete_flag='N' and status_flag = 'waiting' and id='${loan_id}'`,
        // );
       // console.log(data);
        let log = new LogEntity();
        log.module = 'Your Personal Information Updated. IP : ' + ip;
       // log.user_id = rawData[0]['user_id'];
        log.loan_id = loan_id;
        //await this.logRepository.save(log);
        return { statusCode: 200, message: ['success'], data: "data" };
      } else {
        return {
          statusCode: 400,
          message: ['Invalid Loan ID'],
          error: 'Bad Request',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async addLog(loan_id, message) {
    const entityManager = getManager();
    let getUserID = await entityManager.query(
      `SELECT user_id FROM loan where id = '${loan_id}'`,
    );
    let log = new LogEntity();
    log.module = message;
    log.user_id = getUserID[0].user_id;
    log.loan_id = loan_id;
    this.logRepository.save(log);
  }
  async plaidLinkToken(loan_id, ip) {
    console.log("1031");
    const entityManager = getManager();
    const configuration = new Configuration(this.plaidConfig);
    console.log('paild', this.plaidConfig, loan_id);
    try {
      // let clientInfo = await entityManager.query(
      //   `SELECT v.loan_id client_user_id, u.* FROM loan l 
      //   join user u on l.user_id =u.id 
      //   join customer v on v.loan_id = l.id
      //   where l.id='${loan_id}'`,
      // );
     // console.log('user', clientInfo);
      const client = new PlaidApi(configuration);
      // const response = await client.linkTokenCreate({
      //   client_name: process.env.PLAIND_CLIENT_NAME,
      //   products: [Products.Auth, Products.Assets, Products.Transactions],
      //   country_codes: [CountryCode.Us],
      //   language: 'en',
      //   user: { client_user_id: clientInfo[0].client_user_id },
      // });

      const response = await client.linkTokenCreate({
        client_name: process.env.PLAIND_CLIENT_NAME,
        products: [Products.Auth, Products.Assets, Products.Transactions],
        country_codes: [CountryCode.Us],
        language: 'en',
        user: { client_user_id: loan_id },
      });
      console.log('res', response);
      console.log(1060)
      return {
        statusCode: 200,
        token: response.data.link_token,
        data: response.data,
      };
    } catch (error) {
      let errorMessage = error.name + '   ' + error.message;
      this.errorLog(
        loan_id,
        'get link token plaid failed (check user your infromation or plaid keys):' +
          ip,
        errorMessage,
      );
      return { statusCode: 400, message: error.response.data.error_message };
    }
  }
  async errorLog(loan_id, message, error) {
    Logger.log('err------->', error);
    const entityManager = getManager();
    let getUserID = await entityManager.query(
      `SELECT user_id FROM loan where id = '${loan_id}'`,
    );
    let log = new LogEntity();
    log.module = message;
    log.user_id = getUserID[0].user_id;
    log.loan_id = loan_id;
    log.error = error;
    this.logRepository.save(log);
  }

  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  dt(today) {
    var dd: any = today.getDate();

    var mm: any = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }

    if (mm < 10) {
      mm = '0' + mm;
    }
    return yyyy + '-' + mm + '-' + dd;
  }

  async plaidsavetoken(loan_id, public_token, ip) {
    const entityManager = getManager();
    try {
      //token exechange
      const configuration = new Configuration(this.plaidConfig);

      let token: ItemPublicTokenExchangeRequest = {
        public_token: public_token,
      };

      const client = new PlaidApi(configuration);
      const response = await client.itemPublicTokenExchange(token);

      const access_token = response.data.access_token;
      // const rawData = await entityManager.query(
      //   `select user_id from loan where delete_flag = 'N' and step = 4 and id = '${loan_id}'`,
      // );
      //console.log("console.result",rawData)

     // if (rawData.length > 0) {
      if (1) {
        const configuration = new Configuration(this.plaidConfig);
        const client = new PlaidApi(configuration);
        const accounts_response = await client.authGet({
          access_token: access_token,
        });

        let ac = accounts_response.data.accounts;
        let ach = accounts_response.data.numbers.ach;
        let insitutionID = accounts_response.data.item.institution_id;

        let bankData = {};
        bankData['accountslength'] = ac.length;

        //to get bank name
        const request: InstitutionsGetByIdRequest = {
          institution_id: insitutionID,
          country_codes: [CountryCode.Us],
        };
        const instituteResponse = await client.institutionsGetById(request);
        bankData['institutionName'] = instituteResponse.data.institution.name;

        //to get bank holder name
        bankData['bankHolderName'] = 'Unknown';
        try {
          const identityReq: IdentityGetRequest = {
            access_token: access_token,
          };
          const identityRes = await client.identityGet(identityReq);

          bankData['bankHolderName'] =
            identityRes.data.accounts.length > 0
              ? identityRes.data.accounts[0].owners[0].names[0]
              : 'Unknown';
        } catch (error) {
          console.log('IdentityGetRequest', error);
        }
        console.log(1166)
        // console.log('bankHolderName', bankData['bankHolderName']);

        //save plaid access token
        let newPlaid = new PlaidAccessTokenMaster();
       // newPlaid.user_id = rawData[0].user_id;
        newPlaid.user_id = loan_id; 
        newPlaid.loan_id = loan_id;
        newPlaid.plaid_access_token = access_token;
        newPlaid.institutionname = bankData['institutionName'];
        newPlaid.bankholdername = bankData['bankHolderName'];
        let plaidAdded = await this.plaidAccessTokenMasterRepository.save(
          newPlaid,
        );
        await this.createAssets(plaidAdded.id);
        console.log('plaidAdded11', plaidAdded);
        bankData['plaidaccesstokenmasterid'] = plaidAdded.id;

        // console.log('ach', ach);
        console.log(1185)
        //delete old accounts
        // let bankAccountsRes = await this.bankAccountsRepository.find({
        //   loan_id: loan_id,

        //   delete_flag: Flags.N,
        // });
        // if (bankAccountsRes.length > 0) {
        //   for (let i = 0; i < bankAccountsRes.length; i++) {
        //     await this.bankAccountsRepository.update(
        //       { id: bankAccountsRes[i].id, delete_flag: Flags.N },
        //       { delete_flag: Flags.Y },
        //     );
        //   }
        // }

        let account_res_list = [];
        for (let j = 0; j < ac.length; j++) {
          let BankAccount = new BankAccounts();
          BankAccount.loan_id = loan_id;
          BankAccount.plaid_access_token_master_id = plaidAdded.id;
          BankAccount.name = ac[j]['name'].replace('Plaid ', '');
          BankAccount.type = ac[j]['type'];
          BankAccount.subtype = ac[j]['subtype'];
          //BankAccount.acno = 'XXXXXXXXXXXX' + ac[j]['mask'];
          console.log(1210)
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
              BankAccount.acno = ach[i]['account'];
              BankAccount.account_id = ach[i]['account_id'];
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

                //  let account_res = await this.bankAccountsRepository.save(BankAccount);
                // account_res_list.push(account_res);
          /////transactions

          /////transactions
        }
        console.log(1244)
        let item_id: any = accounts_response.data.item.item_id;

        let a = await client.itemWebhookUpdate({
          access_token: access_token,
          webhook:
            process.env.plaid_webhook_url +
            `webhook_type=TRANSACTIONS&webhook_code=INITIAL_UPDATE&item_id=${item_id}&error=null&new_transactions=1500`,
        });
        console.log(1253)
        let b = await client.itemWebhookUpdate({
          access_token: access_token,
          webhook:
            process.env.plaid_webhook_url +
            `webhook_type=TRANSACTIONS&webhook_code=HISTORICAL_UPDATE&item_id=${item_id}&error=null&new_transactions=1500`,
        });
        console.log(1260)
        var d = new Date();
        var d1 = new Date();
        d1.setDate(d1.getDate() - 365);
        const today = this.dt(d);
        const oneYearAgo = this.dt(d1);
        console.log(1266)
        let flinksRequestData;
        this.getAssets(loan_id);
        this.getAlltransactions(access_token, ac, account_res_list);
        console.log(1270)
        // let config = {  //07.02.2022
        //   headers: {
        //     Authorization: 'Bearer EgDedWG4QQnHlgl4',
        //   },
        // };//07.02.2022
        // let salesTransactionDetails: any = await this.httpService
        //   .post(process.env.flinksUrl, flinksRequestData, config)
        //   .toPromise();
        // if (
        //   salesTransactionDetails != undefined &&
        //   salesTransactionDetails.data
        // ) {
        //   await this.plaidAccessTokenMasterRepository.update(
        //     { plaid_access_token: access_token },
        //     { flinksAttr: JSON.stringify(salesTransactionDetails.data) },
        //   );
        // }
        // this.Hubspot.plaidsucces(loan_id);
        // await this.loanRepository.update(
        //   { id: loan_id },
        //   { step: 5, lastscreen: 'Connect Your Bank' },
        // );
        // let data = await entityManager.query(
        //   `select user_id,step,"lastscreen" from loan where delete_flag='N' and status_flag = 'waiting' and id='${loan_id}'`,
        // );
       // console.log(data);
        let log = new LogEntity();
        log.module = 'Your Personal Information Updated. IP : ' + ip;
      //  log.user_id = rawData[0]['user_id'];
        log.loan_id = loan_id;
     //   await this.logRepository.save(log);

        return { statusCode: 200, data: bankData };
      } else {
        // this.Hubspot.plaidfield(loan_id);
        return {
          statusCode: 400,
          message: ['Invalid Loan ID'],
          error: 'Bad Request',
        };
      }
    } catch (error) {
      console.log('plaidsavetoken', error);
      let errorMessage = error.name + '   ' + error.message;
      this.errorLog(loan_id, 'Plaid Login:' + ip, errorMessage);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async getAlltransactions(access_token, ac, account_res_list) {
    let getTransactionRes: any = await this.getTransaction(
      access_token,
      ac,
      account_res_list,
      false,
    );
    let flinksRequestData;
    if (getTransactionRes.statusCode == 400) {
      for (let z = 0; z < 10; z++) {
        await this.timeout(5000); //  Product Not ready from plaid
        getTransactionRes = await this.getTransaction(
          access_token,
          ac,
          account_res_list,
          false,
        );
        if (getTransactionRes.statusCode == 200) {
          await this.timeout(20000); // Get historical plaid Data
          console.log('Get historical plaid Data');
          let ab = (getTransactionRes = await this.getTransaction(
            access_token,
            ac,
            account_res_list,
            true,
          ));

          if (getTransactionRes.statusCode == 200) {
            flinksRequestData = getTransactionRes.flinksRequestData;
            console.log('flinkRequestData16', flinksRequestData);
            break;
          }
        }
      }
    } else {

      await this.timeout(20000); // Get historical plaid Data
      console.log('Get historical plaid Data1');
      getTransactionRes = await this.getTransaction(
        access_token,
        ac,
        account_res_list,
        true,
      );
      if (getTransactionRes.statusCode == 200) {
        flinksRequestData = getTransactionRes.flinksRequestData;
      }
    }
  }
  async createAssets(id){
    const entityManager = getManager();
    try{
        const rawData:any = await entityManager.query(`SELECT plaid_access_token from plaidaccesstokenmaster where id = '${id}' and plaid_access_token is not null;`);
        if(rawData.length>0){
            
            const configuration = new Configuration(this.plaidConfig);
              try {
                const client = new PlaidApi(configuration);
                const days_requested = 183;
                const options = {};
                const response  = await client.assetReportCreate({access_tokens:[rawData[0]['plaid_access_token']],days_requested,options});
                let data = await this.plaidAccessTokenMasterRepository.update(
                  {id:id},
                  {asset_report_token:response.data.asset_report_token}
                )
                return {"statusCode": 200, data:response.data, message:["Request to Create Assets Sent"] };
              } catch (error) {
                console.log(error)
                return {"statusCode": 400,"message": error.response.data.error_message}
              }
        }else{
            return {"statusCode": 200, data:rawData }; 
        }            
    }catch (error) {
        return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
  }
  async getAssets(id){//loan_id
    await this.timeout(60000);
    console.log('mohamed mohideen1233');
    const entityManager = getManager();
    try{
        //fetching all the accounts of a loan ID
        const rawData:any = await entityManager.query(`SELECT id, asset_report_token from plaidaccesstokenmaster where loan_id = '${id}' and asset_report_token is not null;`);
        for(let i=0;i<rawData.length;i++){
            const configuration = new Configuration(this.plaidConfig);
              try {
                const client = new PlaidApi(configuration);
                var d = new Date();
                var d1 = new Date();
                d1.setDate(d1.getDate() - 183);
                const today = this.dt(d);
                const thirtyDaysAgo = this.dt(d1);
                console.log(rawData[i])
                const request: AssetReportGetRequest = {
                  asset_report_token: rawData[i]['asset_report_token'],
                  include_insights: true,
                };//getting the asset reports
                const response  = await client.assetReportGet(request);
               
                response.data.report.items[0].accounts.map(async(e)=>{
                  // console.log("historical data plaid");
                  // console.log(e);
                  let mask = 'XXXXXXXXXXXX'+e.mask;
                  //selecting the right bank account
                  let accInfo = await entityManager.query(`select id from bankaccounts
                   where RIGHT(acno,4) ='${e.mask}' and type='${e.type}' and subtype ='${e.subtype}' and loan_id ='${id}'`);
                   
                  //  console.log('mohamed mohideen');
                  //  console.log(`select id from bankaccounts
                  //  where RIGHT(acno,4) ='${e.mask}' and type='${e.type}' and subtype ='${e.subtype}' and loan_id ='${id}'`)
                  // console.log(accInfo[0])
                  if(accInfo[0]){
                    let historicalBalanceArray=[];
                    e.historical_balances.map((b)=>{
                        let historicalBalance = new HistoricalBalanceEntity();
                        historicalBalance.bankaccountid=accInfo[0]['id']
                        historicalBalance.amount = b.current;
                        historicalBalance.date = new Date(b.date);
                        historicalBalance.currency=b.iso_currency_code;
                        historicalBalanceArray.push(historicalBalance);
                    })
                    // console.log(historicalBalanceArray);
                    let storeRes = await this.historicalBalanceRepository.save(historicalBalanceArray)
                    console.log("Final Result", storeRes);
                  }
                  else{
                    //need to handle if the account is not exists in the bankaccounts
                    //We can have 2 columns assets  -->Y or N and transactions --> Y or N and based on that we shall fetch later
                  }
                })
                return {"statusCode": 200, message:'Asset Report Saved Successfully' }; 
              } catch (error) {
                console.log(error);
                if(error.data.error_code == 'PRODUCT_NOT_READY')
                {
                  return {"statusCode":200,message:["Asset report is not ready yet. Try again later"]}
                }
                console.log(error)
                return {"statusCode": 400,"message": error.response.data.error_message}
              }
        }
        
            return {"statusCode": 200, data:rawData };            
    }catch (error) {
        console.log(error);
        
        return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
    }
}
  async getTransaction(
    access_token,
    ac,
    accountArray,
    isHistorical: boolean = true,
  ) {
    // try {
    const configuration = new Configuration(this.plaidConfig);
    const client = new PlaidApi(configuration);
    var d = new Date();
    var d1 = new Date();
    d1.setDate(d1.getDate() - 185);
    const today = this.dt(d);
    const oneYearAgo = this.dt(d1);

    return await client
      .transactionsGet({
        access_token: access_token,
        start_date: oneYearAgo,
        end_date: today,
      })
      .then(async response => {
        try {
          const total_transactions = response.data.total_transactions;
          console.log(total_transactions);
          console.log('total_transactions');
          let current_transactions = 0;
          let jsonObject = { Transactions: [], Options: {} };
          let currentBalance = 0;
          while (current_transactions < total_transactions) {
            const paginatedRequest: TransactionsGetRequest = {
              access_token: access_token,
              start_date: oneYearAgo,
              end_date: today,
              options: {
                offset: current_transactions,
                count: 500, //max:500
              },
            };

            await client.transactionsGet(paginatedRequest).then(async res => {
              let transactions = res.data.transactions;

              let transactionArray = [];
              for (let j = 0; j < ac.length; j++) {
                currentBalance = ac[j].balances.current;
                jsonObject.Options = {
                  MostRecentBalance: currentBalance,
                  OriginCountry: 'us',
                };
                let eachAccountTransactionArray = []; //to push each acct's transactions in response
                for (let k = 0; k < transactions.length; k++) {
                  if (ac[j]['account_id'] == transactions[k]['account_id']) {
                    let BankTransaction = new BankTransactions();
                    BankTransaction.bankaccountid = accountArray[j].id;
                    BankTransaction.amount = transactions[k]['amount'];
                    if (
                      transactions[k]['category'] &&
                      transactions[k]['category'].length > 0
                    ) {
                      BankTransaction.category = transactions[k][
                        'category'
                      ].toString();
                    } else {
                      BankTransaction.category = 'unknown';
                    }
                    BankTransaction.category_id = transactions[k]['category_id']
                      ? transactions[k]['category_id']
                      : 'unknown';
                    BankTransaction.date = transactions[k]['date'];
                    BankTransaction.name = transactions[k]['name'];
                    BankTransaction.account_id = transactions[k]['account_id'];

                    transactionArray.push(BankTransaction);
                    eachAccountTransactionArray.push(BankTransaction);
                    const formattedTransaction = {
                      TransactionDate: transactions[k].date,
                      Description: transactions[k].name,
                      Debit: null,
                      Credit: null,
                      Balance: currentBalance,
                    };
                    if (transactions[k].amount < 0) {
                      formattedTransaction.Credit = Math.abs(
                        transactions[k].amount,
                      );
                    } else {
                      formattedTransaction.Debit = Math.abs(
                        transactions[k].amount,
                      );
                    }
                    jsonObject.Transactions.push(formattedTransaction);
                  }
                }
              }
              if (isHistorical) {
                let a = await this.bankTransactionsRepository.save(
                  transactionArray,
                );
                console.log(a);
              }
            });

            current_transactions += 500;
          }
          return { statusCode: 200, flinksRequestData: jsonObject };
        } catch (error) {
          if (
            error.data != undefined &&
            error.data.error_code != undefined &&
            error.data.error_code == 'PRODUCT_NOT_READY'
          ) {
            return error.data.error_code;
          } else {
            return error;
          }
        }
      })
      .catch(error => {
        if (
          error.data != undefined &&
          error.data.error_code != undefined &&
          error.data.error_code == 'PRODUCT_NOT_READY'
        ) {
          return error.data.error_code;
        } else if (
          error.error_code != undefined &&
          error.error_code == 'PRODUCT_NOT_READY'
        ) {
          return error.error_code;
        } else {
          return { statusCode: 400 };
        }
      });
  }

  async generateOffer(loan_id: string) {
    try {
      const entityManager = getManager();
      let generateOfferList = [];
      let loanamount = 4000;
      let terms = this.commonService.offersTerms;
      let interestRate = this.commonService.interestRate;
      // let existOffer = await entityManager.query(
      //   `select * from loanoffers 
      //   where delete_flag = 'N' and loan_id = '${loan_id}'
      //   order by "financialamount" desc`,
      // );
      let existOffer = await entityManager.query(
        `select * from loanproductsettings 
          where productid = '5a014b7094a4a92ba5fba4e1'
        `,
      );
      console.log(1626);
      let check = await entityManager.query(
        `select "loanterm" from loansettings where loanactivestatus = 1`,
      );
     // console.log(check);
      if (existOffer.length == 0) {
        if (check[0].payfrequency == 'M') {
          for (let k = 0; k < terms.length; k++) {
            let monthlypayment = this.commonService.findPaymentAmountMonthly(
              loanamount,
              interestRate[k],
              terms[k],
            );
            generateOfferList.push({
              monthlyPay: monthlypayment,
              interestRate: interestRate[k],
              term: terms[k],
            });
            let loanOffers = new LoanOffersEntity();
            loanOffers.financialamount = Number(loanamount);
            loanOffers.monthlyamount = Number(monthlypayment);
            loanOffers.interestrate = Number(interestRate[k]);
            loanOffers.duration = Number(terms[k]);
            loanOffers.offertype = offerTypeFlags.GeneratedByAPI;
            loanOffers.loan_id = loan_id;
            let b = await this.loanOffersRepository.save(loanOffers);
            console.log('bbbb', b);
          }
        } else if (check[0].payfrequency == 'B') {
          for (let k = 0; k < terms.length; k++) {
            let weeklyPayment = this.commonService.findPaymentAmountBiweekly(
              loanamount,
              interestRate[k],
              terms[k],
            );
            generateOfferList.push({
              weeklyPay: weeklyPayment,
              interestRate: interestRate[k],
              term: terms[k],
            });
            let loanOffers = new LoanOffersEntity();
            loanOffers.financialamount = Number(loanamount);
            loanOffers.monthlyamount = Number(weeklyPayment);
            loanOffers.interestrate = Number(interestRate[k]);
            loanOffers.duration = Number(terms[k]);
            loanOffers.offertype = offerTypeFlags.GeneratedByAPI;
            loanOffers.loan_id = loan_id;
            let a = await this.loanOffersRepository.save(loanOffers);
            console.log('aaaaa', a);
          }
        }
      }
      // const offerRes: any = await entityManager.query(
      //   `select * from loanoffers 
      //     where delete_flag = 'N' and loan_id = '${loan_id}'
      //     order by "financialamount" desc`,
      // );
      console.log(1683);
      const offerRes: any = await entityManager.query(
        `select * from loancredittier 
          where credittier = 'D'
          `,
      );
      return { statusCode: 200, data: offerRes };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: ['Your not eligible'],
        error: 'Bad Request',
        offerfailed: true,
      };
    }
  }
  async elligibleOffer(id, elligibleOffer: ElligibleOffer, ip) {
    const entityManager = getManager();
    try {
      // let loanInfo: any = await entityManager.query(`SELECT *  FROM loan 
      // where id = '${id}' 
      // and status_flag = 'waiting' and delete_flag = 'N'`);
      // if (loanInfo.length == 0) {
      //   return {
      //     statusCode: 400,
      //     message: ['This not vaild Loan Id'],
      //   };
      // }
      // let maxAmountOffer: any = await entityManager.query(`select * from loanoffers 
      // where delete_flag = 'N' and loan_id = '${id}'
      // order by "financialamount" desc limit 1`);

              // let offer: any = await entityManager.query(`
              // select * from loanoffers 
              // where delete_flag = 'N' and loan_id = '${id}' and id = '${elligibleOffer.offer_id}'
              // `);
      // console.log(maxAmountOffer[0].financialAmount < elligibleOffer.loanamount);
      // return false;
      // if (maxAmountOffer[0].financialamount < elligibleOffer.loanamount) {
      //   return {
      //     statusCode: 400,
      //     message: [
      //       'Loan amount should be less than or equal to ' +
      //         offer[0].financialamount,
      //     ],
      //   };
      // }
      //selected offer reset
      // await this.loanOffersRepository.update(
      //   { loan_id: id },
      //   { selected_flag: offerFlags.N },
      // );
      // //update selected offer
      // await this.loanOffersRepository.update(
      //   { loan_id: id, id: elligibleOffer.offer_id },
      //   { selected_flag: offerFlags.Y },
      // );
      // //update default OriginationFee cal
      // let OriginationFee: number = Number(process.env.OriginationFee);
      // if (offer[0].originationFee > 0) {
      //   //no dynamic orginationFee Calc
      //   OriginationFee = offer[0].originationFee;
      // } else {
      //   OriginationFee = OriginationFee + elligibleOffer.loanamount / 100;
      // }
      // await this.customerRepository.update(
      //   { loan_id: id },
      //   {
      //     apr: offer[0].interestrate,
      //     loanterm: offer[0].duration,
      //     salesprice: offer[0].salesprice,
      //     downpayment: offer[0].downpayment,
      //     fundedrate: offer[0].fundedrate,
      //     // monthlypayment: elligibleOffer.loanamount,
      //     loanamount: elligibleOffer.loanamount,
      //     // orginationfees: OriginationFee,
      //   },
      // );
                  // let target = await entityManager.query(
                  //   `select "createdat" from loan where id = '${id}'`,
                  // );

                // let paymentScheduleData = await this.createPaymentSchedule(
                //   elligibleOffer.loanamount,
                //   offer[0].interestrate,
                //   offer[0].duration,
                //   target[0].createdat,
                //   id,
                // );
      // console.log(paymentScheduleData.length);
      // let paymentScheduleArray = [];
      // for (let i = 0; i < paymentScheduleData.length; i++) {
      //   let paymentSchedule = new PaymentscheduleEntity();
      //   paymentSchedule.loan_id = id;
      //   paymentSchedule.unpaidprincipal =
      //     paymentScheduleData[i].unpaidprincipal;
      //   paymentSchedule.principal = paymentScheduleData[i].principal;
      //   paymentSchedule.interest = paymentScheduleData[i].interest;
      //   paymentSchedule.fees = paymentScheduleData[i].fees;
      //   paymentSchedule.amount = paymentScheduleData[i].amount;
      //   paymentSchedule.scheduledate = paymentScheduleData[i].scheduledate;
      //   paymentScheduleArray.push(paymentSchedule);
      // }

      // await this.paymentScheduleRepository.update(
      //   { loan_id: id },
      //   { delete_flag: Flags.Y },
      // );
     // await this.paymentScheduleRepository.manager.save(paymentScheduleArray);
     // await this.loanRepository.update({ id: id }, { step: 6 });
      let curDate = new Date();
      return {
        statusCode: 200,
        data: 'Payment Reschedule data successfully',
      };
    } catch (error) {
      console.log(error);
      let errorMessage = error.name + '   ' + error.message;
      this.errorLog(id, 'Save EligibleOffer:' + ip, errorMessage);

      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async createPaymentSchedule(amount, apr, term, createdat, loanid) {
    let entityManager = getManager();
    let rawData = await entityManager.query(
      `select "payfrequency", "payment_duedate" from customer where loan_id='${loanid}'`,
    );
    if (rawData[0].payfrequency == 'M') {
      let paymentScheduler = [];
      let date = new Date(createdat);
      var principal = Number(amount);
      var interest = Number(apr) / 100 / 12;
      var payments = Number(term);
      var x = Math.pow(1 + interest, payments);
      var monthly: any = (principal * x * interest) / (x - 1);
      if (
        !isNaN(monthly) &&
        monthly != Number.POSITIVE_INFINITY &&
        monthly != Number.NEGATIVE_INFINITY
      ) {
        monthly = monthly;
        for (let i = 0; i < payments; i++) {
          // let inter = Math.round((principal * Number(apr)) / 1200);
          // let pri = Math.round(monthly - inter);
          let inter = (principal * Number(apr)) / 1200;
          let pri = monthly - inter;
          paymentScheduler.push({
            loan_id: loanid,
            unpaidprincipal: principal,
            principal: pri,
            interest: inter,
            fees: 0,
            amount: monthly,
            scheduledate: (() => {
              let d = new Date(
                new Date(createdat).setDate(
                  createdat.getDate() + parseInt(rawData[0].payment_duedate),
                ),
              ).toISOString();
              let reqdate = new Date(
                new Date(d).setMonth(new Date(d).getMonth() + (i + 1)),
              )
                .toISOString()
                .substring(0, 10);
              return reqdate;
            })(),
          });
          principal = principal - pri;
        }
      }
      console.log('scheduler', paymentScheduler);
      return paymentScheduler;
    } else if (rawData[0].payfrequency == 'B') {
      let paymentScheduler = [];
      let date = new Date(createdat);

      var principal = Number(amount);
      var interest = Number(apr) / 100 / 26;
      var payments = Number(term);
      var x = Math.pow(1 + interest, payments);
      var biweekly: any = (principal * x * interest) / (x - 1);
      if (
        !isNaN(biweekly) &&
        biweekly != Number.POSITIVE_INFINITY &&
        biweekly != Number.NEGATIVE_INFINITY
      ) {
        biweekly = biweekly;
        for (let i = 0; i < payments; i++) {
          // let inter = Math.round((principal * Number(apr)) / 1200);
          // let pri = Math.round(monthly - inter);
          let inter = (principal * Number(apr)) / 2600;
          let pri = biweekly - inter;
          paymentScheduler.push({
            loan_id: loanid,
            unpaidprincipal: principal,
            principal: pri,
            interest: inter,
            fees: 0,
            amount: biweekly,
            scheduledate: (() => {
              let d = new Date(
                new Date(createdat).setDate(
                  createdat.getDate() + parseInt(rawData[0].payment_duedate),
                ),
              ).toISOString();
              return new Date(
                new Date(d).setDate(new Date(d).getDate() + (i * 14 + 14)),
              )
                .toISOString()
                .substring(0, 10);
            })(),
          });
          principal = principal - pri;
        }
      }
      return paymentScheduler;
    } else if (rawData[0].payfrequency == 'S') {
      let paymentScheduler = [];
      let date = new Date(createdat);

      var principal = Number(amount);
      var interest = Number(apr) / 100 / 24;
      var payments = Number(term);
      var x = Math.pow(1 + interest, payments);
      var semimonthly: any = (principal * x * interest) / (x - 1);
      if (
        !isNaN(semimonthly) &&
        semimonthly != Number.POSITIVE_INFINITY &&
        semimonthly != Number.NEGATIVE_INFINITY
      ) {
        semimonthly = semimonthly;
        for (let i = 0; i < payments; i++) {
          // let inter = Math.round((principal * Number(apr)) / 1200);
          // let pri = Math.round(monthly - inter);
          let inter = (principal * Number(apr)) / 2400;
          let pri = semimonthly - inter;
          paymentScheduler.push({
            loan_id: loanid,
            unpaidprincipal: principal,
            principal: pri,
            interest: inter,
            fees: 0,
            amount: semimonthly,
            scheduledate: (() => {
              let d = new Date(
                new Date(createdat).setDate(
                  createdat.getDate() + parseInt(rawData[0].payment_duedate),
                ),
              ).toISOString();
              return new Date(
                new Date(d).setDate(new Date(d).getDate() + (i * 15 + 15)),
              )
                .toISOString()
                .substring(0, 10);
            })(),
          });
          principal = principal - pri;
        }
      }
      return paymentScheduler;
    }
  }

  async emailverify(loan_id) {
    try {
      let entityManager = getManager();
      let data = await entityManager.query(
        `select user_id from loan where id = '${loan_id}'`,
      );
      await entityManager.query(
        `UPDATE user SET "emailverify" = 'Y' where id = '${data[0].user_id}'`,
      );

      // let data1 = await entityManager.query(`select t."emailverify" as "emailverify" from public.user t join loan t2 on t2.user_id = t.id where t2.id = '${loan_id}'`);
      // console.log(data1)
      return { StatusCode: 200, message: ['success'] };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async triggerMail(loan_id) {
    try {
      let entityManager = getManager();
      // let data = await entityManager.query(
      //   `select t."firstname" as "firstname", t.email as email from public.user t join loan t2 on t2.user_id = t.id where t2.id = '${loan_id}'`,
      // );
      // console.log(data[0].firstname);
      // let name = data[0].firstname;
      // let email = data[0].email;
      // let url = process.env.UI_URL + `/account/emailVerified/${loan_id}`;

      // this.mailService.emailVerification(email, url, name);
      return { statusCode: 200, message: ['Email triggered'] };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async getDocument(id) {
    const entityManager = getManager();
    let data: any = {};
    try {
      // const rawdata = await entityManager.query(
      //   `select u."filepath", c."name" ,c."filename" from "userconsent" u,"consentmaster" c
      //     where c."filekey" = u."filekey" and u."loanid" ='${id}';`,
      // );
      // data = rawdata;
      return { statusCode: 200, data: data };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async updateLoanStatus(loan_id, ip) {
    try {
      let entityManager = getManager();
      // let data = await entityManager.query(
      //   `select count(*) from loan where step = 7 and id='${loan_id}' `,
      // );
     // console.log(data);
     // if (data.length > 0) {
    //  if (1) {
        // await this.loanRepository.update(
        //   { id: loan_id },
        //   {
        //     lastscreen: 'completed',
        //     step: 8,
        //     status_flag: StatusFlags.pending,
        //   },
        // );
        // let data = await entityManager.query(
        //   `select user_id, step, "lastscreen" from loan where id ='${loan_id}'`,
        // );
        let log = new LogEntity();
        log.module = 'Application moved to pending';
       // log.user_id = data[0].user_id;
        log.loan_id = loan_id;
      //  this.logRepository.save(log);

        return { statusCode: 200, message: ['success'], data: 'data' };
     // }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async editEmail(loan_id, editEmailDto: EditEmailDto, ip) {
    try {
      let entityManager = getManager();
      let data = await entityManager.query(
        `select user_id from loan where id ='${loan_id}'`,
      );
      let user_id = data[0].user_id;
      let getUser = await entityManager.query(
        `select count(*) from public.user where email = '${editEmailDto.oldEmail}' and id = '${user_id}'`,
      );
      console.log(getUser);

      if (getUser.length > 0) {
        await this.userRepository.update(
          { _id: user_id },
          {
            email: editEmailDto.newEmail,
          },
        );
        await this.loanRepository.update(
          { id: loan_id },
          {
            email: editEmailDto.newEmail,
          },
        );
        await this.customerRepository.update(
          { user_id: user_id },
          {
            email: editEmailDto.newEmail,
          },
        );
        let log = new LogEntity();
        log.module = 'Email Edited';
        log.user_id = data[0].user_id;
        log.loan_id = loan_id;
        this.logRepository.save(log);

        return { statusCode: 200, message: ['Email Edited successfully!'] };
      } else {
        return {
          statusCode: 400,
          message: ['Invalid Email'],
          error: 'Bad Request',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async editPhonenum(loan_id, editPhoneDto: EditPhonenumDto) {
    try {
      let entityManager = getManager();
      let data = await entityManager.query(
        `select user_id from loan where id ='${loan_id}'`,
      );
      let user_id = data[0].user_id;
      let getUser = await entityManager.query(
        `select count(*) from public.user where id = '${user_id}'`,
      );
      console.log(getUser);

      if (getUser.length > 0) {
        await this.customerRepository.update(
          { user_id: user_id },
          {
            phone: editPhoneDto.newphonenum,
          },
        );
        let log = new LogEntity();
        log.module = 'Phone Number Edited';
        log.user_id = data[0].user_id;
        log.loan_id = loan_id;
        this.logRepository.save(log);

        return { statusCode: 200, message: ['Phone Number Edited successfully!'] };
      } else {
        return {
          statusCode: 400,
          message: ['Invalid Phone Number'],
          error: 'Bad Request',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async creditreport(id) {
    const entityManager = getManager();
    try {
        return { statusCode: 200, data: {}, tradeDebt: {} };
    } catch (error) {
      console.log(error);

      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async getAll(loan_id: string) {
    console.log(loan_id,'loan_detail');
    const entityManager: any = getManager();
    try {
      let result: any = await entityManager.query(
        `select * from loanoffers 
        where delete_flag = 'N' and loan_id = '${loan_id}'`,
      );
      return {
        statusCode: 200,
        data: result,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async getAccounts(id) {
    try {
      let income_list = [
        'PAYROLL',
        'ANNUITY',
        'DIRECT DEP',
        'DIRECT DEPOSIT',
        'DIRECT DEP',
        'DIRDEP',
        'DIR� DEP',
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
        'DIVIDEND',
      ];
      let exclude_list = [
        'BANKING PAYMENT',
        'ONLINE PAYMENT',
        'CREDIT CARD PAYMENT',
      ];

      let category_list = [
        'Tax|Refund',
        'Transfer|Payroll',
        'Transfer|Payroll|Benefits',
      ];

      let NSF_list = ['OVERDRAFT', 'INSUFFICIENT', ' OD FEE', ' NSF'];

      let overdraft_list = [
        'Bank Fees, Insufficient Funds',
        'Bank Fees, Overdraft',
        'Bank Fees',
      ];

      const monthsBtwnDates = startDate => {
        startDate = new Date(startDate);
        let endDate = new Date();
        return Math.max(
          (endDate.getFullYear() - startDate.getFullYear()) * 12 +
            endDate.getMonth() -
            startDate.getMonth(),
          0,
        );
      };

      let income_6mon_amount = 0;
      let income_6mon_avg = 0;
      let nsf_in_1m_cnt = 0;
      let nsf_in_3m_cnt = 0;
      let current_balance = 0;
      let banks = [];
      let plaidAccessTokens = await this.plaidAccessTokenMasterRepository.find({
        loan_id: id,
        delete_flag: Flags.N,
      });
      if (plaidAccessTokens.length) {
        for (let p = 0; p < plaidAccessTokens.length; p++) {
          let bankAccounts = await this.bankAccountsRepository.find({
            where: {
              loan_id: id,
              plaid_access_token_master_id: plaidAccessTokens[p].id,
              delete_flag: Flags.N,
            },
          });
          if (bankAccounts.length > 0) {
            for (let i = 0; i < bankAccounts.length; i++) {
              //rule5 calc start: Current balance
              if (bankAccounts[i].type == 'depository') {
                current_balance += bankAccounts[i].current;
              }
              //rule5 end

              let bankTransactionsRes = await this.bankTransactionsRepository.find(
                { where: { bankaccountid: bankAccounts[i].id } },
              );
              //bankAccounts[i]['transactions'] = bankTransactionsRes;
              //console.log(bankTransactionsRes)
              for (let j = 0; j < bankTransactionsRes.length; j++) {
                let trans_months = monthsBtwnDates(
                  new Date(bankTransactionsRes[j].date),
                );
                let trans_name = bankTransactionsRes[j].name.toUpperCase();
                let trans_description = bankTransactionsRes[
                  j
                ].name.toUpperCase();
                let trans_category = bankTransactionsRes[j].category
                  .split(',')
                  .join('|');

                //rule 1 calc start:Average income in 6 months
                if (
                  bankTransactionsRes[j].amount < -5 &&
                  trans_months <= 6 &&
                  ((category_list.includes(trans_category) == true &&
                    exclude_list.includes(trans_name) == false) ||
                    income_list.includes(trans_name) ||
                    income_list.includes(trans_description))
                ) {
                  income_6mon_amount += bankTransactionsRes[j].amount;
                }
                //rule 1 end
                //rule 2 calc start: NSF transactions in a month
                if (
                  trans_months <= 1 &&
                  (NSF_list.includes(trans_name) == true ||
                    NSF_list.includes(trans_description) == true ||
                    overdraft_list.indexOf(trans_category) > -1)
                ) {
                  nsf_in_1m_cnt += 1;
                }
                //rule 2 end

                //rule 3 calc start: NSF transactions in 3 months
                if (
                  trans_months <= 3 &&
                  (NSF_list.includes(trans_name) == true ||
                    NSF_list.includes(trans_description) == true ||
                    overdraft_list.indexOf(trans_category) > -1)
                ) {
                  nsf_in_3m_cnt += 1;
                }
                //rule3 end

                //rule4 calc Average balance in 6 months
                //to be implemented separately
                //rule4 end
              }
            }
          }
          //banks.push({bankname: plaidAccessTokens[p].institutionName, bankAccounts: bankAccounts})
        }
        //rule1 data point and rule 8 data point
        income_6mon_avg = income_6mon_amount / 6;
        income_6mon_avg = income_6mon_avg * -1;
        console.log(income_6mon_avg);
        return { statusCode: 200, data: banks };
      } else {
        return { statusCode: 100, message: 'No Accounts Available' };
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async getConsentList() {
    const entityManager = getManager();
    const rawdata = await entityManager.query(
      `select id_consent,"filename","filekey" from consentmaster where "filekey" in (120,125,126,132)`,
    );

    //console.log(rawdata);
    return rawdata;
  }

  async getempdetails(id) {
    const entityManager = getManager();
    let data: any = {};
    try {
      // const rawdata = await entityManager.query(
      //   // `select t1."firstname" , t1."lastname", t1.unit, t1."streetaddress", t1.city, t1.state, t1."zipcode", 
      //   // t1."employerphone", t1."workstatus", t1."jobtitle", t1.employer, t1."annualincome", t1."payfrequency",
      //   //  t1."dateofhired", t1."payment_duedate", t1."procedure_startdate",t.scheduledate,to_char(t.createdat,'yyyy-mm-dd') as createddate from paymentschedule t 
      //   // join customer t1 on t.loan_id = t1.loan_id 
      //   // where t.loan_id ='${id}'`,
      //   `select t1."firstname" , t1."lastname", t1.unit, t1."streetaddress", t1.city, t1.state, t1."zipcode", 
      //   t1."employerphone", t1."workstatus", t1."jobtitle", t1.employer, t1."annualincome", t1."payfrequency",
      //    t1."dateofhired", t1."payment_duedate", t1."procedure_startdate",t.scheduledate,
      //    to_char(t.createdat,'yyyy-mm-dd') as createddate 
      //    from paymentschedule t 
      //    right join loan loa on loa.id = t.loan_id
      //   join customer t1 on loa.id = t1.loan_id 
      //   where loa.id ='${id}'`
      // );
      // data = rawdata;
      return { statusCode: 200, data: data };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
}
