import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentScheduleRepository } from 'src/repository/paymentSchedule.repository';
import { getManager } from 'typeorm';
import { LogInLogsDto, Logs } from './dto/logs.dto';
import { LogEntity, LogTypeFlags } from '../../entities/log.entity';
import { LogRepository } from '../../repository/log.repository';

@Injectable()
export class OverviewService {
  constructor(
    @InjectRepository(PaymentScheduleRepository)
    private readonly paymentScheduleRepository: PaymentScheduleRepository,
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
  ) {}

  async getOverview(id) {
    // console.log('getOverview call');
    console.log(id);

    const entityManager = getManager();
    try {
      const rawData = await entityManager.query(
        `select count(*) as count from public.user where isdeleted=false and ` +
          "_id = '" +
          id +
          "'",
      );
      // console.log('rawData', rawData);

      if (rawData[0]['count'] > 0) {
        let data = {};
        data['user_details'] = await entityManager.query(`
          select u.*,p.amount,p.loantermcount as loanterm,p.apr as apr,p._id as loan_id from public.user u left join paymentmanagement p on p.user=u._id where u._id = '${id}'
        `);

        return { statusCode: 200, data: data };
      } else {
        return {
          statusCode: 500,
          message: ['This User Id Not Exists'],
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

  async logs(logs: Logs) {
    let log = new LogEntity();
    log.module = logs.module;
    log.user_id = logs.user_id;
    log.loan_id = logs.loan_id;
    log.type = LogTypeFlags[logs.type];

    try {
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

  async addLoginLog(logInLogsDto: LogInLogsDto, ip) {
    try {
      let log = new LogEntity();
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
}
