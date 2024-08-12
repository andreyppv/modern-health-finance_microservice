import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateMailcontrollerDto } from './dto/create-mailcontroller.dto';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import { getManager } from 'typeorm';
import { MailService } from '../../mail/mail.service';
import { config } from 'dotenv';
import { LogRepository } from '../../repository/log.repository';
import { LogEntity } from '../../entities/log.entity';
import { InjectRepository } from '@nestjs/typeorm';
config();

@Injectable()
export class MailcontrollersService {
  constructor(
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
    @InjectSendGrid() private readonly client: SendGridService,
  ) {}

  async inviteEmail(id, purposeOfTheMail) {
    try {
      const service = new MailService(this.client);
      const entityManager = getManager();
      service.mail(id, purposeOfTheMail);
      const logRawData = await entityManager.query(
        `select user_id from loan where id = '${id}'`,
      );
      const log = new LogEntity();
      log.loan_id = id;
      log.user_id = logRawData[0].user_id;
      log.module = 'Admin : Mail Service';
      //log.message = 'Mail has been sent to user';
      await this.logRepository.save(log);

      return { statusCode: 200, data: 'Mail Sent Successfully' };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async testemail(id, purposeOfTheMail, email) {
    try {
      const service = new MailService(this.client);
      service.testMail(id, purposeOfTheMail, email);
      return { statusCode: 200, data: 'Mail Sent Successfully' };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
}
