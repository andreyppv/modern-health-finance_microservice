import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { LoanRepository } from '../../repository/loan.repository';
import { Flags, StatusFlags } from '../../entities/loan.entity';
import { getManager } from 'typeorm';
import * as moment from 'moment'

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
  ) {}

  async get(user_id) {
    const entityManager = getManager();
    const data: any = {};
      // if (roleid[0].role == 1) {
        const rawData = await entityManager.query(
          `select count (*) as count from paymentmanagement t join public.user t2 on t2._id = t.user where (t.status = 'PENDING') AND (t.achstatus = 0)`
        );
    
        data.pending_application = rawData[0]['count'];
           
        const rawData1 = await entityManager.query(
          `select count(*) as count from paymentmanagement t 
          where (t.status = 'OPENED') And  (t.isPaymentActive = true) AND (t.achstatus = 1) and 
          ( (t.firstpaymentcompleted=0) OR (t.firstpaymentcompleted=NULL)) AND 
         ( (t.moveToArchive=0) OR (t.moveToArchive=NULL))`);
        data.incomplete_application = rawData1[0]['count'];
        console.log(data);
        const rawData2 = await entityManager.query(
         ` select count(*) as count from paymentmanagement t
         where (t.status = 'OPENED') And  (t.isPaymentActive = true) AND 
         ( (t.firstpaymentcompleted=0) OR (t.firstpaymentcompleted=NULL)) AND 
         ( (t.moveToArchive=0) OR (t.moveToArchive=NULL))`
          );
        data.approvedcontract_application = rawData2[0]['count'];

        const rawData3 = await entityManager.query(
        `select count(*) as count   
         from paymentmanagement t join public.user t2 on t2._id = t.user 
           where ((t.status = 'OPENED') OR (t.status = 'DENIED'))  And
           (t.achstatus = 2) AND
           ( (t.moveToArchive=NULL)  AND
           (t.createdAt >= '${moment().startOf('day').subtract(2, "months").format('YYYY-MM-DD hh:mm:ss')}')) OR (t.movetoarchive = 0)`);
        data.canceled_application = rawData3[0]['count'];
        console.log('data.----------------->', data.canceled_application);
        const rawData4 = await entityManager.query(
          `
            SELECT 
              count(*) as count
            FROM
              "user" t2
              JOIN practicemanagement t3 ON t3._id = t2.practicemanagement 
          `)
          
        data.all_application = rawData4[0]['count'];
        console.log(data);
        return { statusCode: 200, data: data };
  }
}
