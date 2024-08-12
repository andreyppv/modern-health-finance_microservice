import { Module } from '@nestjs/common';
import { UpdateuserloanService } from './updateuserloan.service';
import { UpdateuserloanController } from './updateuserloan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerRepository } from '../../repository/customer.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerRepository])],
  controllers: [UpdateuserloanController],
  providers: [UpdateuserloanService],
})
export class UpdateuserloanModule {}
