import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerRepository } from '../../repository/customer.repository';
import { LogRepository } from '../../repository/log.repository';
import { LoanRepository } from '../../repository/loan.repository';
import { UploadUserDocumentRepository } from '../../repository/userdocumentupload.repository';
import { PaymentscheduleRepository } from '../../repository/paymentschedule.repository';
import { uploadUserDocument } from 'src/entities/uploaduserdocument.entity';
import { UserRepository } from 'src/repository/users.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerRepository,
      LoanRepository,
      LogRepository,
      UserRepository,
      PaymentscheduleRepository,
      UploadUserDocumentRepository,
    ]),
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
