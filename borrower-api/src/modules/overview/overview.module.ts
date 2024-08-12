import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentScheduleRepository } from 'src/repository/paymentSchedule.repository';
import { LogRepository } from '../../repository/log.repository';
import { OverviewController } from './overview.controller';
import { OverviewService } from './overview.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentScheduleRepository,LogRepository])
  ],
  controllers: [OverviewController],
  providers: [OverviewService]
})
export class OverviewModule {}
