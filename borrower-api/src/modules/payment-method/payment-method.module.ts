import { Module } from '@nestjs/common';
import { PaymentMethodController } from './payment-method.controller';
import { PaymentMethodService } from './payment-method.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDebitCardRepository } from 'src/repository/userDebitCard.repository';
import { UserBankAccountRepository } from 'src/repository/userBankAccounts.repository';
import { CustomerRepository } from 'src/repository/customer.repository';
import { TransactionRepository } from 'src/repository/transaction.repository';
import { NotificationRepository } from 'src/repository/notification.repository';
import { PaymentScheduleRepository } from 'src/repository/paymentSchedule.repository';
import {HttpModule} from '@nestjs/axios';
import { MailService } from 'src/mail/mail.service';
import { LogRepository } from '../../repository/log.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserDebitCardRepository,TransactionRepository,UserBankAccountRepository,CustomerRepository,NotificationRepository,PaymentScheduleRepository,LogRepository]),
    HttpModule
  ],
  controllers: [PaymentMethodController],
  providers: [PaymentMethodService,MailService]
})
export class PaymentMethodModule {}
