import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAuditlogDto } from './dto/create-auditlog.dto';
import { getManager } from 'typeorm';

@Injectable()
export class AuditlogsService {
  async get() {
    const entityManager = getManager();
    try {
      // const rawData = await entityManager.query(
      //   `select CONCAT ('LOG_',t.id) as id, CONCAT ('LON_',t3.ref_no) as loan_id, t.module as module, concat(t2.email,' - ',INITCAP(r."name"::text)) as user, t."createdat" as createdat from log t join loan t3 on t3.id = t.loan_id join user t2 on t2.id = t.user_id join roles r on r.id = t2.role order by t."createdat" desc limit 1000;`,
      // );
      const rawData = await entityManager.query(
        `SELECT
        t1.logreference AS ID,
        t2.loanreference AS loan_id,
        t1.modulename AS MODULE,
        concat ( t1.email, ' - ', INITCAP( t1."email" :: TEXT ) ) AS USER,
        t1.createdat AS createdat 
      FROM
        logactivity t1
        LEFT JOIN paymentmanagement t2 ON t1.paymentmanagement = t2._id 
      `
      )
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
  async loginLog() {
    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(`select 
                        CONCAT ('USR_',u.ref_no) as user_ref,
                        u.id as user_id,
                        concat(u.email,' - ',INITCAP(r."name"::text)) as user,
                        l.module as module,                              
                        l."createdat" as createdat 
                    from log l                        
                    join user u on u.id = l.user_id 
                    join roles r on r.id = u.role 
                    where l.type='login'
                    order by 
                        l."createdat" desc 
                    limit 1000;`);
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
