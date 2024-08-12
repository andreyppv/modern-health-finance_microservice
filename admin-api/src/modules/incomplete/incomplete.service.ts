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
@Injectable()
export class IncompleteService {
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
  ) {}
  async get() {
    const entityManager = getManager();
    // const rawData = await entityManager.query(`
    //     SELECT
    //       t3._id AS loanid,
    //       t2._id AS user_id,
    //       t2.userreference AS user_ref,
    //       t2."firstname" AS firstname,
    //       t2.email AS email, 
    //       t3."status" as regstatus,
    //       t2.phonenumber as phno,
    //       t3.practicename as practicename,
    //       to_char(t2.createdat,'yyyy-mm-dd') as createddate
    //     FROM
    //       "user" t2
    //       JOIN practicemanagement t3 ON t3._id = t2.practicemanagement 
    //     ORDER BY
    //       t3.createdat ASC
    // `);
    const rawData = await entityManager.query(`
    SELECT
      t3._id AS loanid,
      t2._id AS user_id,
      t2.userreference AS user_ref,
      t2."firstname" AS firstname,
      t2.email AS email, 
      t3."status" as regstatus,
      t2.phonenumber as phno,
      t3.practicename as practicename
     
    FROM
      "user" t2
      JOIN practicemanagement t3 ON t3._id = t2.practicemanagement 
    ORDER BY
      t3.createdat ASC
`);

    console.log('incomplete phone number', rawData);
    return { statusCode: 200, data: rawData };
  }

  async getAll() {
    console.log('Hello');
    try {
      const entityManager = getManager();
      let customerDetails = await entityManager.query(`select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t2.email as email, t2.ref_no as user_ref, t2."firstname" as firstname, t2."lastname" as lastname
      from loan t join user t2 on t2.id = t.user_id where t.delete_flag = 'N' order by t."createdat" desc`);
      return { statusCode: 200, data: customerDetails };
    } catch (error) {
      console.log(error);
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
        `select count(*) as count from loan where delete_flag = 'N' and active_flag = 'N' and status_flag = 'waiting' and ` +
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

        //data['answers'] = [];
        data['from_details'] = await entityManager.query(
          "select t.*, t2.ref_no as user_ref from customer t join user t2  on t2.id = t.user_id where t.loan_id = '" +
            id +
            "'",
        );
        // if (data['from_details'][0]['isCoApplicant']) {
        //   data['CoApplicant'] = await entityManager.query(
        //     "select * from coapplication where id = '" +
        //       data['from_details'][0]['coapplican_id'] +
        //       "'",
        //   );
        // } else {
        //   data['CoApplicant'] = [];
        // }
        // data['files'] = await entityManager.query(
        //   "select originalname,filename from files where link_id = '" +
        //     id +
        //     "'",
        // );
        // data['paymentScheduleDetails'] = await entityManager.query(
        //   `select * from paymentschedule where loan_id = '${id}'  order by "scheduledate" asc`,
        // );
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
      console.log(error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
}
