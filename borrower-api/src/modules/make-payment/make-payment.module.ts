import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerRepository } from 'src/repository/customer.repository';
import { PaymentScheduleRepository } from 'src/repository/paymentSchedule.repository';
import { PaymentDetailsService } from '../payment-details/payment-details.service';
import { MakePaymentController } from './make-payment.controller';
import { MakePaymentService } from './make-payment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentScheduleRepository]),
    TypeOrmModule.forFeature([CustomerRepository])
  ],
  controllers: [MakePaymentController],
  providers: [
    MakePaymentService,
    PaymentDetailsService
  ]
})
export class MakePaymentModule {}
