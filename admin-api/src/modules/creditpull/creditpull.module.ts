import { Module } from '@nestjs/common';
import { CreditpullService } from './creditpull.service';
import { CreditpullController } from './creditpull.controller';
import { CustomerRepository } from '../../repository/customer.repository';
import { CreditPullRepository } from '../../repository/creditPull.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerRepository, CreditPullRepository]),
  ],
  controllers: [CreditpullController],
  providers: [CreditpullService],
})
export class CreditpullModule {}
