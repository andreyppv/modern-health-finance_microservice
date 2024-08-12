import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { getManager } from 'typeorm';

@Injectable()
export class ApprovedService {
  async get() {
    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(`select t.id as loan_id, t.user_id as user_id, t.ref_no as loan_ref, t2.email as email, t2.ref_no as user_ref, t2."firstname" as firstName, t2."lastname" as lastname
            from loan t join user t2 on t2.id = t.user_id where t.delete_flag = 'N' and t.active_flag = 'Y' and t.status_flag = 'approved' order by t."createdat" desc `);
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

  async getdetails(id) {
    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(
        `select count(*) as count from loan where delete_flag = 'N' and active_flag = 'Y' and status_flag = 'approved' and ` +
          "id = '" +
          id +
          "'",
      );
      if (rawData[0]['count'] > 0) {
        const data = {};
        //data['answers'] = await entityManager.query("select t.answer as answer, t2.question as question from answer t join question t2 on t2.id= t.question_id where loan_id = '"+id+"'")
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

  async getlogs(id) {
    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(
        `select logreference as id, t.modulename as module,t2.email as user, t."createdat" as createdat from logactivity t join "adminuser" t2 on t2._id = t.adminuser  where t.paymentmanagement = '${id}' order by t."createdat" desc;`,
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
}
