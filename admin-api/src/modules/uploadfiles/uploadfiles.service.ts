import { Body, Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  CreateUploadDto,
  createPaymentSchedulerDto,
  DeleteUploadFileDto,
} from './dto/create-uploadfile.dto';
const pupeetree = require('puppeteer');
import { S3 } from 'aws-sdk';
import { Logger } from '@nestjs/common';
import { uploadUserDocument } from '../../entities/uploaduserdocument.entity';
import { UploadUserDocumentRepository } from '../../repository/userdocumentupload.repository';
import { LoanRepository } from '../../repository/loan.repository';
import { CustomerRepository } from '../../repository/customer.repository';
import { extname } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager } from 'typeorm';
import { StatusFlags, Loan } from '../../entities/loan.entity';
import { PaymentscheduleRepository } from '../../repository/paymentschedule.repository';
import { PaymentscheduleEntity } from '../../entities/paymentschedule.entity';
import { LogRepository } from '../../repository/log.repository';
import { LogEntity } from '../../entities/log.entity';
import { Flags } from 'src/entities/loan.entity';
import { UserRepository } from '../../repository/users.repository';
const path = require('path');
const fs = require('fs');
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import { MailService } from '../../mail/mail.service';
@Injectable()
export class UploadfilesService {
  router: any;
  constructor(
    @InjectRepository(UploadUserDocumentRepository)
    private readonly UploadUserDocumentRepository: UploadUserDocumentRepository,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    @InjectRepository(PaymentscheduleRepository)
    private readonly paymentscheduleRepository: PaymentscheduleRepository,
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectSendGrid()
    private readonly client: SendGridService,
  ) {}

  async save(files,createUploadDto: CreateUploadDto,ip) {
    const file = new uploadUserDocument();
    file.orginalfilename = files.orginalfileName;
    file.filename = files.filename;
    file.loan_id = createUploadDto.loan_id;
    file.type = createUploadDto.type;
    try {
      await this.UploadUserDocumentRepository.save(file);
      const log = new LogEntity();
      log.module = 'Documents Added:' + ip;
      log.loan_id = createUploadDto['loan_id']; 
      log.user_id = createUploadDto['user_id']; 
      await this.logRepository.save(log);

      return { statusCode: 200, data: 'Files will be uploaded successfully' };

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
      // const rawdata = await entityManager.query(
      //   `select u."filepath", c."name" ,c."filename" from "userconsent" u,"consentmaster" c
      //   where c."filekey" = u."filekey" and u."loanid" ='${id}';`,
      // );
      // data = rawdata;
      // return { statusCode: 200, data: data };
      return {statusCode:200, data :{}}
    } catch (error) {
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
      // const rawdata = await entityManager.query(
      //   `select "orginalfilename","filename","type" from useruploaddocument where loan_id = '${id}'`,
      // );
      // data = rawdata;
      // return { statusCode: 200, data: data };
      return { statusCode: 200, data: {} };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async pendingStage(createPaymentSchedulerDto) {
    const entityManager = getManager();

    await this.loanRepository.update(
      { id: createPaymentSchedulerDto.loan_id },
      { active_flag: Flags.Y, status_flag: StatusFlags.pending },
    );
    await this.loanRepository.update(
      { id: createPaymentSchedulerDto.loan_id },
      { lastscreen: 'completed' },
    );
    const customerData = await entityManager.query(
      `select * from customer where loan_id = '${createPaymentSchedulerDto.loan_id}'`,
    );
    const logRawData = await entityManager.query(
      `select user_id from loan where id = '${createPaymentSchedulerDto.loan_id}'`,
    );
    const paymentScheduleData = await this.createPaymentSchedule(
      customerData[0].loanamount,
      customerData[0].apr,
      customerData[0].loanterm,
      customerData[0].createdat,
      createPaymentSchedulerDto.loan_id,
    );
    const paymentScheduleCheck = await this.paymentscheduleRepository.find({
      where: {
        loan_id: createPaymentSchedulerDto.loan_id,
      },
    });
    if (paymentScheduleCheck.length == 0) {
      const paymentScheduleArray = [];
      for (let i = 0; i < paymentScheduleData.length; i++) {
        const paymentSchedule = new PaymentscheduleEntity();
        paymentSchedule.loan_id = createPaymentSchedulerDto.loan_id;
        paymentSchedule.unpaidprincipal =
          paymentScheduleData[i].unpaidprincipal;
        paymentSchedule.principal = paymentScheduleData[i].principal;
        paymentSchedule.interest = paymentScheduleData[i].interest;
        paymentSchedule.fees = paymentScheduleData[i].fees;
        paymentSchedule.amount = paymentScheduleData[i].amount;
        paymentSchedule.scheduledate = paymentScheduleData[i].scheduledate;
        paymentScheduleArray.push(paymentSchedule);
      }
      const pendingMail = new MailService(this.client);
      pendingMail.mail(createPaymentSchedulerDto.loan_id, 'Pending');
      await this.paymentscheduleRepository.save(paymentScheduleArray);
      await this.userRepository.update(
        { _id: logRawData[0].user_id },
        { role: '2' },
      );
      const log = new LogEntity();
      log.loan_id = createPaymentSchedulerDto.loan_id;
      log.user_id = logRawData[0].user_id;
      log.module = 'Admin: Payment Scheduler';
      //log.message = 'payment schedule create for this user';
      await this.logRepository.save(log);

      return {
        statusCode: 200,
        data: 'Payment Scheduler will be created successfully',
      };
    }
  }

  //create Payment Schedule
  async createPaymentSchedule(amount, apr, term, createdat, loanid) {
    const paymentScheduler = [];
    const date = new Date(createdat);

    let principal = Number(amount);
    const interest = Number(apr) / 100 / 12;
    const payments = Number(term);
    const x = Math.pow(1 + interest, payments);
    let monthly: any = (principal * x * interest) / (x - 1);
    if (
      !isNaN(monthly) &&
      monthly != Number.POSITIVE_INFINITY &&
      monthly != Number.NEGATIVE_INFINITY
    ) {
      monthly = Math.round(monthly);
      for (let i = 0; i < payments; i++) {
        const inter = Math.round((principal * Number(apr)) / 1200);
        const pri = Math.round(monthly - inter);
        paymentScheduler.push({
          loan_id: loanid,
          unpaidprincipal: principal,
          principal: pri,
          interest: inter,
          fees: 0,
          amount: monthly,
          scheduledate: (() => {
            return new Date(
              new Date(createdat).setMonth(
                new Date(createdat).getMonth() + (i + 1),
              ),
            )
              .toISOString()
              .substring(0, 10);
          })(),
        });
        principal = Math.round(principal - pri);
      }
    }
    return paymentScheduler;
  }

  //*  Payment Schedule Api
  async getPaymentSchedule(id) {
    const entityManager = getManager();
    let data: any = {};
    try {
      const rawdata = await entityManager.query(
        `select "unpaidprincipal","principal","interest","fees","amount","scheduledate" from paymentschedule where loan_id = '${id}'`,
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

  async deleteUploadFile(loan_id, deleteUploadFileDto: DeleteUploadFileDto) {
    console.log(loan_id + '   ' + deleteUploadFileDto);
    try {
      await this.UploadUserDocumentRepository.delete({
        loan_id: loan_id,
        filename: deleteUploadFileDto.fileName,
        type: deleteUploadFileDto.type,
      });
      return {
        statusCode: 200,
        message: ['success'],
        data: 'User upload files deleted successfully',
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
}
