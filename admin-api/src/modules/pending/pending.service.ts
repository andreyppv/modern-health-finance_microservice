import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager } from 'typeorm';
import { manualBankAddDto } from './dto/manual-bank-add.dto';
// import { UserBankAccount } from '../../entities/userBankAccount.entity';
// import { UserBankAccountRepository } from '../../repository/userBankAccounts.repository';
import { UserRepository } from '../../repository/users.repository';
import { UsersRole } from '../../entities/users.entity';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { MailService } from '../../mail/mail.service';
import { addcommentsDto } from './dto/add-comments.dto';
import { CommentsRepository } from '../../repository/comments.repository';
import { Comments } from '../../entities/comments.entity';
import { Logs, LogInLogsDto } from './dto/add-log.dto';
import { LogRepository } from '../../repository/log.repository';
import { LogEntity, LogTypeFlags } from '../../entities/log.entity';
import { UploadfilesService } from '../../modules/uploadfiles/uploadfiles.service';
import { UploadUserDocumentRepository } from '../../repository/userdocumentupload.repository';
import { LoanRepository } from 'src/repository/loan.repository';
import { PaymentscheduleRepository } from '../../repository/paymentschedule.repository';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import {
  SignningPromissoryNote,
  PromissoryNoteService,
} from '../../promissory-note/promissory-note.service';
import { commonService } from '../../common/helper-service';
import { UserConsentRepository } from '../../repository/userConsent.repository';
import { PaymentcalculationService } from '../../paymentcalculation/paymentcalculation.service';
config();

@Injectable()
export class PendingService {
  constructor(
    // @InjectRepository(UserBankAccountRepository)
    // private readonly userBankAccountRepository: UserBankAccountRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(CommentsRepository)
    private readonly commentsRepository: CommentsRepository,
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
    @InjectRepository(PaymentscheduleRepository)
    private readonly paymentscheduleRepository: PaymentscheduleRepository,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    @InjectRepository(UploadUserDocumentRepository)
    private readonly uploadUserDocumentRepository: UploadUserDocumentRepository,
    @InjectRepository(UserConsentRepository)
    private readonly userConsentRepository: UserConsentRepository,
    private readonly mailService: MailService,
    @InjectSendGrid() private readonly client: SendGridService,
  ) {}

  async get() {
    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(`select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t2.email as email, t2.ref_no as user_ref, t2."firstname" as firstname, t2."lastname" as lastname
            from loan t join user t2 on t2.id = t.user_id where t.delete_flag = 'N' and t.active_flag = 'Y' and t.status_flag = 'pending' order by t."createdat" desc `);
      return { statusCode: 200, data: rawData };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async getdetails(id) {
    const entityManager = getManager();
    const viewDocument = new UploadfilesService(
      this.uploadUserDocumentRepository,
      this.loanRepository,
      this.paymentscheduleRepository,
      this.logRepository,
      this.userRepository,
      this.client,
    );
    try {
      const rawData = await entityManager.query(
        `select count(*) as count from loan where delete_flag = 'N' and active_flag = 'Y' and status_flag = 'pending' and ` +
          "id = '" +
          id +
          "'",
      );
      if (rawData[0]['count'] > 0) {
        const data = {};
        // data['answers'] = await entityManager.query(
        //   "select t.answer as answer, t2.question as question from answer t join question t2 on t2.id= t.question_id where loan_id = '" +
        //     id +
        //     "'",
        // );
        data['from_details'] = await entityManager.query(
          "select t.*, t2.ref_no as user_ref from customer t join user t2  on t2.id = t.user_id where t.loan_id = '" +
            id +
            "'",
        );
        if (data['from_details'][0]['isCoApplicant']) {
          data['CoApplicant'] = await entityManager.query(
            "select * from coapplication where id = '" +
              data['from_details'][0]['coapplican_id'] +
              "'",
          );
        } else {
          data['CoApplicant'] = [];
        }
        data['files'] = await entityManager.query(
          "select originalname,filename from files where link_id = '" +
            id +
            "'",
        );
        data['paymentScheduleDetails'] = await entityManager.query(
          `select * from paymentschedule where loan_id = '${id}'  order by "scheduledate" asc`,
        );

        data['document'] = await (await viewDocument.getDocument(id)).data;
        data['userDocument'] = await (await viewDocument.getUserDocument(id))
          .data;
        return { statusCode: 200, data: data };
      } else {
        return {
          statusCode: 500,
          message: ['This Loan Id Not Exists'],
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

  async setdenied(id) {
    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(
        `select count(*) as count from loan where delete_flag = 'N' and active_flag = 'Y' and status_flag = 'pending' and ` +
          "id = '" +
          id +
          "'",
      );
      if (rawData[0]['count'] > 0) {
        await entityManager.query(
          `UPDATE loan
                SET status_flag='canceled'::loan_status_flag_enum::loan_status_flag_enum
                WHERE ` +
            "id = '" +
            id +
            "'",
        );
        //console.log(rawData)
        return { statusCode: 200 };
      } else {
        return {
          statusCode: 500,
          message: ['This Loan Id Not Exists'],
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

  async setapproved(id, ip) {
    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(
        `select count(*) as count from loan where delete_flag = 'N' and active_flag = 'Y' and status_flag = 'pending' and ` +
          "id = '" +
          id +
          "'",
      );
      const user_id = await entityManager.query(
        `select "user_id" as user_id from loan where delete_flag = 'N' and active_flag = 'Y' and status_flag = 'pending' and ` +
          "id = '" +
          id +
          "'",
      );
      const getUserDetails = await entityManager.query(
        `select * from customer where loan_id = '${id}'`,
      );
      if (rawData[0]['count'] > 0 && user_id.length > 0) {
        await entityManager.query(
          `UPDATE loan
                SET status_flag='approved'::loan_status_flag_enum::loan_status_flag_enum
                WHERE ` +
            "id = '" +
            id +
            "'",
        );
        await entityManager.query(`UPDATE user
        SET active_flag='Y'::user_active_flag_enum::user_active_flag_enum
        WHERE id='${user_id[0]['user_id']}';`);
        const PN = new PromissoryNoteService(
          this.userConsentRepository,
          this.loanRepository,
          this.logRepository,
        );
        const htmlData = await PN.getPromissoryNote(id);
        this.mailService.mail(id, 'PromissoryNote');
        const cs = new commonService(this.logRepository);
        cs.addLogs(id, 'Promissory Note Mail Trigered' + '   ' + ip);
        await this.loanRepository.update(
          { id: id },
          { lastscreen: 'promissorynote' },
        );
        return { statusCode: 200 };
      } else {
        return {
          statusCode: 500,
          message: ['This Loan Id Not Exists'],
          error: 'Bad Request',
        };
      }
    } catch (error) {
      const errorMessage = error.name + '   ' + error.message;
      const cs = new commonService(this.logRepository);
      cs.errorLogs(
        id,
        'Promissory Note Mail Trigered' + ' ' + ip,
        errorMessage,
      );
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async invite(id) {
    let url: any = process.env.UI_URL;
    let length = 8,
      charset =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      password = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }
    const salt = await bcrypt.genSalt();
    const hashPassword: any = await bcrypt.hash(password, salt);

    try {
      const user: any = await this.userRepository.find({
        select: ['email', 'salt', 'isemailverified'],
        where: { id: id, role: UsersRole.CUSTOMER },
      });
      if (user.length > 0) {
        if (!user[0]['emailverify']) {
          url = url + 'borrower/verify/' + id + '/' + salt;
          await this.userRepository.update(
            { _id: id },
            { salt: salt, password: hashPassword },
          );
        } else {
          password = 'Password already sent your mail';
          url = url + 'borrower/verify/' + id + '/' + user[0]['salt'];
        }
        this.mailService.inviteEmail(user[0]['email'], password, url);
        return { statusCode: 200 };
      } else {
        return {
          statusCode: 500,
          message: ['This User Id Not Exists'],
          error: 'Bad Request',
        };
      }

      //await this.userRepository.update({id: id}, { salt: salt, password:hashPassword });
    } catch (error) {
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

  async addcomments(addcommentsDto: addcommentsDto, ip) {
    const entityManager = getManager();
    try {
      const getUserDetails = await entityManager.query(
        `select email from customer where loan_id ='${addcommentsDto.loan_id}'`,
      );
      const comment = new Comments();
      comment.subject = addcommentsDto.subject;
      comment.comments = addcommentsDto.comments;
      comment.loan_id = addcommentsDto.loan_id;
      comment.user_id = addcommentsDto.user_id;
      await this.commentsRepository.save(comment);
      this.mailService.sendCommentToCustomer(
        addcommentsDto.loan_id,
        getUserDetails[0].email,
        addcommentsDto.subject,
        addcommentsDto.comments,
      );
      
      const log = new LogEntity();
      log.module = 'Comments Added:' + ip;
      log.user_id = addcommentsDto.user_id;
      log.loan_id = addcommentsDto.loan_id;
      await this.logRepository.save(log);

      return { statusCode: 200 };
    } catch (error) {
      console.log('err--->', error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async getcomments(id) {
    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(
        `select t.subject, t.comments ,t2.role , t2.firstname , t2.lastname ,t.createdat from comments t join user t2 on t2.id=t.user_id where t.loan_id = '${id}' order by t.createdat desc`,
      );

      //console.log(rawData)
      return { statusCode: 200, data: rawData };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async logs(logs: Logs) {
    const log = new LogEntity();
    log.module = logs.module;
    log.user_id = logs.user_id;
    log.loan_id = logs.loan_id;
    try {
      this.logRepository.save(log);
      return { statusCode: 200, data: 'Logs will be created successfully' };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async addLoginLog(logInLogsDto: LogInLogsDto, ip) {
    try {
      const log = new LogEntity();
      log.module = 'User Logged In from IP:' + ip;
      log.user_id = logInLogsDto.user_id;
      log.type = LogTypeFlags['login'];

      await this.logRepository.save(log);
      return { statusCode: 200 };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async getPaymentScheduleDetails(loan_id) {
    const entityManager = getManager();
    try {
      const data = {};
      data['from_details'] = await entityManager.query(
        "select t.*, t2.ref_no as user_ref from customer t join user t2  on t2.id = t.user_id where t.loan_id = '" +
          loan_id +
          "'",
      );
      data['paymentScheduleDetails'] = await entityManager.query(
        `select * from paymentschedule where loan_id = '${loan_id}'  order by "scheduledate" dsc`,
      );

      return {
        statusCode: 200,
        data: data,
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
