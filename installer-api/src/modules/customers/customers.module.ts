import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesRepository } from 'src/repository/files.repository';
import { InstallingInfoRepository } from 'src/repository/installingInfo.repository';
import { LoanRepository } from 'src/repository/loan.repository';
import { SystemInfoRepository } from 'src/repository/systemInfo.repository';
import { NotificationRepository } from 'src/repository/notification.repository';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomerRepository } from 'src/repository/customer.repository';
import { CommentsRepository } from 'src/repository/comments.repository';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [TypeOrmModule.forFeature([FilesRepository,LoanRepository,SystemInfoRepository,InstallingInfoRepository,NotificationRepository, CustomerRepository, CommentsRepository])],
  controllers: [CustomersController],
  providers: [CustomersService,MailService]
})
export class CustomersModule {}
