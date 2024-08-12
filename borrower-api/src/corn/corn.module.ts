import { Module } from '@nestjs/common';
import { CornService } from './corn.service';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentScheduleRepository } from 'src/repository/paymentSchedule.repository';
import { LogRepository } from '../repository/log.repository';
import { TransactionRepository } from 'src/repository/transaction.repository';
import { NotificationRepository } from 'src/repository/notification.repository';
import { MailService } from 'src/mail/mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {HttpModule} from '@nestjs/axios';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([TransactionRepository,NotificationRepository,PaymentScheduleRepository,LogRepository]),
    HttpModule
  ],
  providers: [CornService,MailService]
})
export class CornModule {}
