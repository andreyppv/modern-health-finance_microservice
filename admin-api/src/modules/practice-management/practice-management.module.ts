import { Module } from '@nestjs/common';
import { PracticeManagementService } from './practice-management.service';
import { PracticeManagementController } from './practice-management.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';
import {PracticeRepository} from 'src/repository/practice.repository';
import { FilesRepository } from 'src/repository/files.repository';
import { UserRepository } from 'src/repository/users.repository';
import { FilesService } from '../files/files.service';
import { LoanRepository } from 'src/repository/loan.repository';
@Module({
  controllers: [PracticeManagementController],
  imports:[TypeOrmModule.forFeature([
    PracticeRepository,
    FilesRepository,
    UserRepository,
    LoanRepository,
  ])],
  providers: [PracticeManagementService,MailService,FilesService]
})
export class PracticeManagementModule {}
