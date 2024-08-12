import { Module } from '@nestjs/common';
import { LoanoffersService } from './loanoffers.service';
import { LoanoffersController } from './loanoffers.controller';
import { MailService } from '../../mail/mail.service';
import { LoanOffersRepository } from 'src/repository/loanOffers.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([LoanOffersRepository])],
  controllers: [LoanoffersController],
  providers: [LoanoffersService, MailService],
})
export class LoanoffersModule {}
