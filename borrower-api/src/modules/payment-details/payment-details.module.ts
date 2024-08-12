import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerRepository } from 'src/repository/customer.repository';
import { PaymentScheduleRepository } from 'src/repository/paymentSchedule.repository';
import { PaymentDetailsController } from './payment-details.controller';
import { PaymentDetailsService } from './payment-details.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentScheduleRepository]),
    TypeOrmModule.forFeature([CustomerRepository])
  ],
  controllers: [PaymentDetailsController],
  providers: [PaymentDetailsService]
})
export class PaymentDetailsModule {}
