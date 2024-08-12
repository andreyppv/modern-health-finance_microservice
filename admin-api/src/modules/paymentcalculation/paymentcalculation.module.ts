import { Module } from '@nestjs/common';
import { PaymentcalculationService } from './paymentcalculation.service';

@Module({
  providers: [PaymentcalculationService],
})
export class PaymentcalculationModule {}
