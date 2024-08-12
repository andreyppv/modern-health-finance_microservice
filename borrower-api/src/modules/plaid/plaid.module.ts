import { Module } from '@nestjs/common';
import { PlaidService } from './plaid.service';
import { PlaidController } from './plaid.controller';
import { CustomerRepository } from '../../repository/customer.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  controllers: [PlaidController],
  imports:[TypeOrmModule.forFeature([CustomerRepository])],
  exports: [PlaidService],
  providers: [PlaidService]
})
export class PlaidModule {}
