import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { LoanRepository } from '../../repository/loan.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([LoanRepository])],
  exports: [DashboardService],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
