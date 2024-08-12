import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EntityManager, getManager } from 'typeorm';
import { LoanRepository } from '../../repository/loan.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { commonService } from '../../common/helper-service';
import { LogRepository } from '../../repository/log.repository';
import { UploadUserDocumentRepository } from '../../repository/userdocumentupload.repository';
import { PaymentscheduleRepository } from '../../repository/paymentschedule.repository';
//import { PaymentmanagementRepository } from '../../repository/paymentmanagement.repository';
import * as moment from 'moment';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import { UploadfilesService } from '../uploadfiles/uploadfiles.service';
import {
  UpdateUserLoanAmount,
  createPaymentSchedulerDto,
  manualBankAddDto,
  UpdatePendingapplicationDto,
  UpdateEmployInfo,
} from '../loanstage/dto/update-loanstage.dto';
import { CustomerRepository } from '../../repository/customer.repository';
import { PaymentscheduleEntity } from '../../entities/paymentschedule.entity';
import { PaymentcalculationService } from '../../paymentcalculation/paymentcalculation.service';
import { UserRepository } from 'src/repository/users.repository';
import { LogEntity } from 'src/entities/log.entity';
// import { UserBankAccountRepository } from 'src/repository/userBankAccounts.repository';
import { CustomerEntity } from 'src/entities/customer.entity';
import { Flags, StatusFlags } from 'src/entities/loan.entity';
import { MailService } from '../../mail/mail.service';
import { consoleTestResultHandler } from 'tslint/lib/test';
@Injectable()
export class LoanstageService {
  constructor(
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
    @InjectRepository(UploadUserDocumentRepository)
    private readonly uploadUserDocumentRepository: UploadUserDocumentRepository,
    @InjectRepository(PaymentscheduleRepository)
    private readonly paymentscheduleRepository: PaymentscheduleRepository,
    @InjectRepository(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
    // @InjectRepository(UserBankAccountRepository)
    // private readonly userBankAccountRepository: UserBankAccountRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectSendGrid() private readonly client: SendGridService,
    private readonly mailService: MailService,
  ) { }
  async getAllCustomerDetails(stage, user_id) {
    const entityManager = getManager();

    let viewtype = stage;
    let options = {};
    let totalrecords = 0;
    console.log(viewtype);
    let paymentManagementPromise = [];
    if (viewtype == "approved") {
      paymentManagementPromise = await entityManager.query(
        ` select t._id as loan_id,t.payoffamount as payoffamount, t.apr as apr,t.loanreference as loan_ref,t2.userreference as ref_no,t2._id as user_id,   
      t2.firstname as firstname, t2.lastname as lastname, t2.email as email, t2.phonenumber as phone   
   from paymentmanagement t join public.user t2 on t2._id = t.user 
      where (t.status = 'OPENED') And  (t.isPaymentActive = true) AND 
      ( (t.firstpaymentcompleted=0) OR (t.firstpaymentcompleted=NULL)) AND 
      ( (t.moveToArchive=0) OR (t.moveToArchive=NULL)) ORDER BY t.user` )

    } else if (viewtype == "fundingcontract") {
      // options = { status: 'FUNDED' };
      paymentManagementPromise = await entityManager.query(
        ` select t._id as loan_id,t.payoffamount as payoffamount, t.apr as apr, t.loanreference as loan_ref,t2.userreference as ref_no,t2._id as user_id,
      t2.firstname as firstname, t2.lastname as lastname, t2.email as email, t2.phonenumber as phone   
   from paymentmanagement t join public.user t2 on t2._id = t.user 
      where (t.status = 'FUNDED') ORDER BY t.user`)

    } else if (viewtype == "pending") {

      // options = { status: 'PENDING', achstatus: 0 };
      paymentManagementPromise = await entityManager.query(
        ` select t._id as loan_id,t.payoffamount as payoffamount, t.apr as apr, t.loanreference as loan_ref,t2.userreference as ref_no,  t2._id as user_id,
         t2.firstname as firstname, t2.lastname as lastname, t2.email as email, t2.phonenumber as phone   
      from paymentmanagement t join public.user t2 on t2._id = t.user 
      
      where (t.status = 'PENDING') AND (t.achstatus = 0) ORDER BY t.user`)
    } else if (viewtype == "denied") {
      let query = `select t._id as loan_id,t.payoffamount as payoffamount,t.loanreference as loan_ref,t2.userreference as ref_no, t._id as loan_id, t.apr as apr,t2._id as user_id,
     t2.firstname as firstname, t2.lastname as lastname, t2.email as email, t2.phonenumber as phone   
      from paymentmanagement t join public.user t2 on t2._id = t.user 
        where ((t.status = 'OPENED') OR (t.status = 'DENIED'))  And
        (t.achstatus = 2) AND
        ( (t.moveToArchive=NULL)  AND
        (t.createdAt >= '${moment().startOf('day').subtract(2, "months").format('YYYY-MM-DD hh:mm:ss')}')) OR (t.movetoarchive = 0) ORDER BY t.user`;
      paymentManagementPromise = await entityManager.query(query);
    } else {

      paymentManagementPromise = await entityManager.query(`select t._id as loan_id,t.payoffamount as payoffamount,t.loanreference as loan_ref,t2.userreference as ref_no, t.apr as apr,t2._id as user_id,
            t2.firstname as firstname, t2.lastname as lastname, t2.email as email, t2.phonenumber as phone   
          from paymentmanagement t join public.user t2 on t2._id = t.user 
        where (t.status = 'OPENED') And  (t.isPaymentActive = true) AND 
        ( (t.firstpaymentcompleted=0) OR (t.firstpaymentcompleted=NULL)) AND 
        ( (t.moveToArchive=0) OR (t.moveToArchive=NULL)) ORDER BY t.user`)
    }
    totalrecords = paymentManagementPromise.length;

    //Final output starts here
    const pendinguser = [];
    paymentManagementPromise.forEach(function (paydata, loopvalue) {
      let loopid = loopvalue + 1;
      let appReference = "--";
      let payloanReference = "--";
      let payuserName = "--";
      let payuserEmail = "--";
      let payuserphoneNumber = "--";
      let registeredtype = "--";
      let practicename = "--";
      let procedureDate = "--";
      let payOffAmount = '';
      let creditScore = "--";
      let createdAt;
      let updatedAt;
      let apr = "--";
      let fundingTier = "";
      let systemUniqueKeyURL = 'getAchUserDetails/' + paydata.id;
      //appReference = paydata.screentracking.applicationReference;
      if (paydata.loanReference != "" && paydata.loanReference != null) {
        payloanReference = '<a href=\'' + systemUniqueKeyURL + '\'>' + paydata.loanReference + '</a>';
      }
      if (paydata.user) {
        if (paydata.user.firstname != "" && paydata.user.firstname != null) {
          payuserName = paydata.user.firstname + " " + paydata.user.lastname;
        }
        if (paydata.user.email != "" && paydata.user.email != null) {
          payuserEmail = paydata.user.email;
        }
        if (paydata.user.phoneNumber != "" && paydata.user.phoneNumber != null) {
          payuserphoneNumber = paydata.user.phoneNumber.replace(/[^\d]/g, "");
          payuserphoneNumber = payuserphoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
        }
        if (paydata.user.registeredtype) {
          registeredtype = paydata.user.registeredtype;
        }
      }
      if (paydata.practicemanagement) {
        if (paydata.practicemanagement.PracticeName != "" && paydata.practicemanagement.PracticeName != null) {
          practicename = paydata.practicemanagement.PracticeName;
        }
      }
      if (paydata.fundingTier) {
        fundingTier = paydata.fundingTier;
      }
      if (paydata.loanSetdate) {
        procedureDate = moment(paydata.loanSetdate).format("MM-DD-YYYY");
      }
      if (paydata.payOffAmount) {
        payOffAmount = paydata.payOffAmount;
      }
      if (paydata.creditScore) {
        creditScore = paydata.creditScore;
      }
      //	paydata.createdAt = moment(paydata.createdAt).format("MM-DD-YYYY");
      createdAt = paydata.createdAt;
      //	paydata.updatedAt = moment(paydata.updatedAt).format("MM-DD-YYYY");
      updatedAt = paydata.updatedAt;
      if (paydata.hasOwnProperty("apr")) {
        apr = parseFloat(paydata.apr) + "%";
      }
      // status icon
      var statusicon = '';
      if (paydata.achstatus == 0) {
        statusicon = '<i class=\'fa fa-circle text-warning\' aria-hidden=\'true\' ></i>&nbsp;&nbsp;Pending';
      }
      if (paydata.achstatus == 1) {
        statusicon = '<i class=\'fa fa-circle text-success\' aria-hidden=\'true\' ></i>&nbsp;&nbsp;Approved';
      }
      if (paydata.achstatus == 2) {
        if (paydata.deniedfromapp == 1) {
          statusicon = '<i class=\'fa fa-circle text-danger\' aria-hidden=\'true\' ></i>&nbsp;&nbsp;Denied (from app)';
        } else {
          statusicon = '<i class=\'fa fa-circle text-danger\' aria-hidden=\'true\' ></i>&nbsp;&nbsp;Denied';
        }
      }
      pendinguser.push({
        loopid: loopid,
        appReference: appReference,
        loanReference: payloanReference,
        name: payuserName,
        email: payuserEmail,
        phoneNumber: payuserphoneNumber,
        practicename: practicename,
        fundingtier: fundingTier,
        procedureDate: procedureDate,
        payOffAmount: payOffAmount,
        createdAt: createdAt,
        updatedAt: updatedAt,
        apr: apr,
        status: statusicon,
        creditScore: creditScore,
        registeredtype: registeredtype
      });
    });
    const fetch_json = {
      //	sEcho: req.query.sEcho,
      iTotalRecords: totalrecords,
      iTotalDisplayRecords: totalrecords,
      data: paymentManagementPromise,
      statusCode: 200
    };
    // res.contentType("application/json");
    // res.json(json);
    //console.log(paymentManagementPromise);
    // console.log(pendinguser)
    return (fetch_json);
  }



  //Get A Particular Customer Details
  async getACustomerDetails(id, stage) {
    const viewDocument = new UploadfilesService(
      this.uploadUserDocumentRepository,
      this.loanRepository,
      this.paymentscheduleRepository,
      this.logRepository,
      this.userRepository,
      this.client,
    );
    const entityManager = getManager();
    try {
      console.log(id);
      let rawData = '';
      rawData = await entityManager.query(
        `select count(*) as count from paymentmanagement where _id='${id}'`
      );
      if (rawData[0]['count'] > 0) {
        const data = {};
        data['from_details'] = await entityManager.query(
          `SELECT
          u.*,
          s.incomeamount as monthlyincome,
          s.incomeamount * 12 as annualincome
        FROM
          "paymentmanagement" T 
          LEFT JOIN "user" u ON T.USER = u._id
          left join screentracking s on t.screentracking = s._id
          where t._id = '${id}'`
        );
        
        data['stage'] = await entityManager.query(
          `SELECT status FROM paymentmanagement where _id = '${id}'`,
        );
        
        data['document'] = await (await viewDocument.getDocument(id)).data;
        data['userDocument'] = await (await viewDocument.getUserDocument(id)).data;
        
        return { statusCode: 200, data: data };
      } else {
        return {
          statusCode: 500,
          message: ['This Loan Id Not Exists'],
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
  async getALogs(id) {
    const entityManager = getManager();
    try {
      const logData = await entityManager.query(
        `select CONCAT ('LOG_',t.id) as id, t.module as module, concat(t2.email,' - ',INITCAP(t2."role"::text)) as user, t."createdat" as createdat from log t join public.user t2 on t2.id = t.user_id  where t.loan_id = '${id}' order by t."createdat" desc;`,
      );
      //console.log(rawData)
      return { statusCode: 200, data: logData };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async movedToNextStage(id, nextStage) {
    try {
      await this.loanRepository.update(
        { id: id },
        { status_flag: nextStage.stage },
      );
      return { statusCode: 200, data: 'Loan Details Updated succesfully ' };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async editCustomerLoanAmountDetails(
    id,
    updateUserLoanAmount: UpdateUserLoanAmount,
  ) {
    const entityManager = getManager();
    try {
      let paymentDetails = await entityManager.query(
        `SELECT * FROM paymentschedule where loan_id ='${id}' order by "scheduledate" ASC`,
      );
      let currentDate = new Date();
      if (paymentDetails[0].scheduledate < currentDate) {
        return {
          statusCode: 400,
          message: 'Frist payment schedule is started.So you can,t Reschedule',
          error: 'Bad Request',
        };
      }
      const ps = new PaymentcalculationService();
      const getRealAPR = ps.findPaymentAmountWithOrigination(
        updateUserLoanAmount.loanamount,
        updateUserLoanAmount.apr,
        updateUserLoanAmount.duration,
        updateUserLoanAmount.orginationFee,
      );
      await this.customerRepository.update(
        { loan_id: id },
        {
          loanamount: updateUserLoanAmount.loanamount,
          apr: updateUserLoanAmount.apr,
          loanterm: updateUserLoanAmount.duration,
          orginationfees: updateUserLoanAmount.orginationFee,
          newapr: getRealAPR.realAPR,
        },
      );
      let paymentFrequency = await entityManager.query(
        `SELECT "payfrequency" FROM customer where loan_id = '${id}'`,
      );
      let PaymentReschedule = {};
      PaymentReschedule['loan_id'] = id;
      PaymentReschedule['paymentFrequency'] = paymentFrequency[0].payfrequency;
      PaymentReschedule['date'] = paymentDetails[0].scheduledate;
      await this.paymentRescheduler(PaymentReschedule);
      return { statusCode: 200, data: 'Update user loan details successfully' };
    } catch (error) {
      console.log('error---------->', error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async paymentRescheduler(createPaymentSchedulerDto) {
    const entityManager = getManager();
    try {
      const customerData = await entityManager.query(
        `select * from customer where loan_id = '${createPaymentSchedulerDto.loan_id}'`,
      );
      const getLoanStatus = await entityManager.query(
        `select "status_flag" from loan where id = '${createPaymentSchedulerDto.loan_id}'`,
      );
      if (
        getLoanStatus[0].status_flag == 'performingcontract' ||
        getLoanStatus[0].status_flag == 'approved'
      ) {
        return {
          statusCode: 400,
          message: 'you cant"t do payment reschedule at this satge',
          error: 'Bad Request',
        };
      }
      const futureDate = new Date(createPaymentSchedulerDto.date);
      const currentDate = new Date();

      let dueDate = customerData[0].payment_duedate;
      let dates1 = futureDate.setDate(futureDate.getDate() + parseInt(dueDate));
      let newDate = new Date(dates1).toISOString();

      if (currentDate > futureDate) {
        return {
          statusCode: 400,
          message: 'your date should be greater than today date',
          error: 'Bad Request',
        };
      }
      const pc = new PaymentcalculationService();
      const getPaymentReschedulerData = pc.createPaymentReScheduler(
        customerData[0].loanamount,
        customerData[0].apr,
        customerData[0].loanterm,
        newDate,
        //futureDate,
        createPaymentSchedulerDto.paymentFrequency,
        createPaymentSchedulerDto.loan_id,
      );
      const getPaymentScheduleData = await this.paymentscheduleRepository.find({
        loan_id: createPaymentSchedulerDto.loan_id,
      });
      if (getPaymentScheduleData.length > 1) {
        const paymentScheduleArray = [];
        for (let i = 0; i < getPaymentReschedulerData.length; i++) {
          const paymentSchedule = new PaymentscheduleEntity();
          paymentSchedule.loan_id = createPaymentSchedulerDto.loan_id;
          paymentSchedule.unpaidprincipal = getPaymentReschedulerData[i].unpaidprincipal;
          paymentSchedule.principal = getPaymentReschedulerData[i].principal;
          paymentSchedule.interest = getPaymentReschedulerData[i].interest;
          paymentSchedule.fees = getPaymentReschedulerData[i].fees;
          paymentSchedule.amount = getPaymentReschedulerData[i].amount;
          paymentSchedule.scheduledate = getPaymentReschedulerData[i].scheduledate;
          paymentScheduleArray.push(paymentSchedule);
        }
        await this.paymentscheduleRepository.delete({
          loan_id: createPaymentSchedulerDto.loan_id,
        });
        console.log('paymentScheduleArray => ', paymentScheduleArray);
        await this.paymentscheduleRepository.save(paymentScheduleArray);
        await this.customerRepository.update(
          { loan_id: createPaymentSchedulerDto.loan_id },
          {
            payfrequency: createPaymentSchedulerDto.paymentFrequency,
          },
        );
      }
      return {
        statusCode: 200,
        data: 'Payment Rescheduler Data updated Successfully',
      };
    } catch (error) {
      console.log('error---->', error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async manualBankAdd(manualBankAddDto: manualBankAddDto) {
    try {
      // const userBankAccount = new UserBankAccount();
      // userBankAccount.bankname = manualBankAddDto.bankname;
      // userBankAccount.holdername = manualBankAddDto.holdername;
      // userBankAccount.routingnumber = manualBankAddDto.routingnumber;
      // userBankAccount.accountnumber = manualBankAddDto.accountnumber;
      // userBankAccount.user_id = manualBankAddDto.user_id;

      // await this.userBankAccountRepository.save(userBankAccount);
      // return {
      //   statusCode: 200,
      //   data: 'User Bank account details  will be added successfully',
      // };
    } catch (error) {
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
      const rawdata = await entityManager.query(
        `select u."filepath", c."name" ,c."filename" from "userconsent" u,"consentmaster" c
        where c."filekey" = u."filekey" and u."loanid" ='${id}';`,
      );
      data = rawdata;
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

  async getUserDocument(id) {
    const entityManager = getManager();
    let data: any = {};
    try {
      const rawdata = await entityManager.query(
        `select "orginalfilename","filename","type" from useruploaddocument where loan_id = '${id}'`,
      );
      data = rawdata;
      return { statusCode: 200, data: data };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async updatePendingApp(
    loan_id,
    updatePendingAppDto: UpdatePendingapplicationDto,
  ) {
    try {
      let entityManager = getManager();

      let data = await entityManager.query(
        `select user_id, id from loan where id = '${loan_id}'`,
      );

      if (data.length > 0) {
        await this.customerRepository.update(
          { loan_id: loan_id },
          {
            procedure_startdate: updatePendingAppDto.procedure_startdate,
            payment_duedate: updatePendingAppDto.payment_duedate,
          },
        );
        //payment rescheduler
        let paymentFrequency = await entityManager.query(
          `SELECT "payfrequency" FROM customer where loan_id = '${loan_id}'`,
        );
        let paymentcreateddate = await entityManager.query(
          `SELECT "createdat" from loan where id = '${loan_id}' `,
        );
        let PaymentReschedule = {};
        PaymentReschedule['loan_id'] = loan_id;
        PaymentReschedule['paymentFrequency'] = paymentFrequency[0].payfrequency;
        //PaymentReschedule['date'] = updatePendingAppDto.procedure_startdate;//paymentDetails[0].scheduledate;
        PaymentReschedule['date'] = paymentcreateddate[0].createdat;//paymentDetails[0].scheduledate;

        await this.paymentRescheduler(PaymentReschedule);

        await this.loanRepository.update(
          { id: loan_id },
          {
            status_flag: StatusFlags.approvedcontract,
            active_flag: Flags.Y,
          },
        );
        this.mailService.mail1(loan_id, 'Welcome');

        return {
          statusCode: 200,
          message: [
            'Application stage successfully moved from pending to Approved Contract',
          ],
        };
      } else {
        return {
          statusCode: 400,
          message: ['Loan Id not exist'],
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

  async makeArchive(loan_id) {
    try {
      let entityManager = getManager();
      let data = await entityManager.query(
        `select status_flag from loan where id = '${loan_id}'`,
      );
      let previous_stage = data[0].status_flag;
      if (data.length > 0) {
        await entityManager.query(
          `UPDATE loan
                SET status_flag='archive'::loan_status_flag_enum::loan_status_flag_enum
                WHERE ` +
          "id = '" +
          loan_id +
          "'",
        );
        return {
          statusCode: 200,
          message: ['Loan Application Archived Successfully!!'],
          prev_stage: previous_stage,
        };
      } else {
        return {
          statusCode: 400,
          message: ['Invalid Loan Id'],
          error: 'Bad Request',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
      };
    }
  }

  async setdenied(loan_id) {
    try {
      let entityManager = getManager();
      let data = await entityManager.query(
        `select status_flag from loan where id = '${loan_id}'`,
      );
      let previous_stage = data[0].status_flag;
      if (data.length > 0) {
        await entityManager.query(
          `UPDATE loan
                SET status_flag='canceled'::loan_status_flag_enum::loan_status_flag_enum
                WHERE ` +
          "id = '" +
          loan_id +
          "'",
        );
        return {
          statusCode: 200,
          message: ['Loan Application denied Successfully!!'],
          prev_stage: previous_stage,
        };
      } else {
        return {
          statusCode: 400,
          message: ['Invalid Loan Id'],
          error: 'Bad Request',
        };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
      };
    }
  }

  async getProcedureStartDate(loan_id) {
    try {
      let entityManager = getManager();
      let data = await entityManager.query(
        `select "procedure_startdate", "loanamount" from customer where loan_id ='${loan_id}'`,
      );
      console.log('data');

      return { statusCode: 200, message: ['success'], data: data };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: ['Bad Request'],
      };
    }
  }

  async updateProcedureDate(
    loan_id,
    updatePendingAppDto: UpdatePendingapplicationDto,
  ) {
    try {
      let entityManager = getManager();
      let data = await entityManager.query(
        `select count(*) from loan where status_flag ='approvedcontract' and id = '${loan_id}'`,
      );
      if (data[0].count > 0) {
        await this.customerRepository.update(
          { loan_id: loan_id },
          {
            procedure_startdate: updatePendingAppDto.procedure_startdate,
          },
        );
        return { statusCode: 200, message: ['success'] };
      } else {
        return {
          statusCode: 400,
          message: ['Loan Id not Exist!'],
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

  async setFundingContract(loan_id) {
    try {
      let entityManager = getManager();

      let data = await entityManager.query(
        `select count(*) from loan where status_flag = 'approvedcontract' and id ='${loan_id}' `,
      );
      console.log(data);
      if (data[0].count > 0) {
        await this.loanRepository.update(
          { id: loan_id },
          {
            status_flag: StatusFlags.fundingcontract,
          },
        );
        return { statusCode: 200, message: ['success'] };
      } else {
        return { statusCode: 400, message: ['Loan Id not exist!'] };
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

  async updateemploydetails(id, updateEmployInfo: UpdateEmployInfo) {
    try {
      let updData: any = {};
      if (updateEmployInfo.employer) {
        updData.employer = updateEmployInfo.employer;
      }
      if (updateEmployInfo.employerphone) {
        updData.employerphone = updateEmployInfo.employerphone;
      }
      if (updateEmployInfo.streetaddress) {
        updData.streetaddress = updateEmployInfo.streetaddress;
      }
      if (updateEmployInfo.city) {
        updData.city = updateEmployInfo.city;
      }
      if (updateEmployInfo.state) {
        updData.state = updateEmployInfo.state;
      }
      if (updateEmployInfo.zipcode) {
        updData.zipcode = updateEmployInfo.zipcode;
      }
      if (updateEmployInfo.annualincome) {
        updData.annualincome = updateEmployInfo.annualincome;
      }
      if (updateEmployInfo.payment_duedate) {
        updData.payment_duedate = updateEmployInfo.payment_duedate;
      }
      await this.customerRepository.update({ loan_id: id }, updData);
      let entityManager = getManager();
      let data = await entityManager.query(
        `select payment_duedate,payfrequency from customer where loan_id ='${id}' `,
      );
      if (data[0].payment_duedate != updateEmployInfo.payment_duedate) {
        let PaymentReschedule = {};
        PaymentReschedule['loan_id'] = id;
        PaymentReschedule['paymentFrequency'] = data[0].payfrequency;
        PaymentReschedule['date'] = updateEmployInfo.createdat;
        console.log('payment')
        await this.paymentRescheduler(PaymentReschedule);
        console.log('reschedule')
      }

      return {
        statusCode: 200,
        message: 'Data Updated Successfully',
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: new InternalServerErrorException(error)['response']['name'],
        error: 'Bad Request',
      };
    }
  }

}
