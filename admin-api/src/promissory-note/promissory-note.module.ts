import { Module } from '@nestjs/common';
import { PromissoryNoteService } from './promissory-note.service';
import { PromissoryNoteController } from './promissory-note.controller';
import { UserConsentRepository } from '../repository/userConsent.repository';
import { LoanRepository } from '../repository/loan.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogRepository } from '../repository/log.repository';

@Module({
  controllers: [PromissoryNoteController],
  imports: [
    TypeOrmModule.forFeature([
      LoanRepository,
      UserConsentRepository,
      LogRepository,
    ]),
  ],
  providers: [PromissoryNoteService],
})
export class PromissoryNoteModule {}
