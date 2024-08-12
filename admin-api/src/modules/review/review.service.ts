import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Any, getManager } from 'typeorm';
import { CustomerRepository } from '../../repository/customer.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserName } from '../review/dto/update-review.dto';
import * as bcrypt from 'bcrypt';
import { UploadfilesService } from '../../modules/uploadfiles/uploadfiles.service';
import { PaymentcalculationService } from '../../paymentcalculation/paymentcalculation.service';
import { LogRepository } from '../../repository/log.repository';
import { LoanRepository } from '../../repository/loan.repository';
import { UploadUserDocumentRepository } from '../../repository/userdocumentupload.repository';
import { PaymentscheduleRepository } from '../../repository/paymentschedule.repository';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import { LogEntity } from '../../entities/log.entity';
import { groupBy } from 'rxjs/operators';
import { commonService } from '../../common/helper-service';
import { UserRepository } from 'src/repository/users.repository';
@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
    @InjectRepository(UploadUserDocumentRepository)
    private readonly uploadUserDocumentRepository: UploadUserDocumentRepository,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    @InjectRepository(PaymentscheduleRepository)
    private readonly paymentscheduleRepository: PaymentscheduleRepository,
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectSendGrid() private readonly client: SendGridService,
  ) {}
  async getDetails(id) {
    const entityManager = getManager();
    const viewDocument = new UploadfilesService(
      this.uploadUserDocumentRepository,
      this.loanRepository,
      this.paymentscheduleRepository,
      this.logRepository,
      this.userRepository,
      this.client,
    );
    try {
      const rawData = await entityManager.query(
        `select count(*) as count , "lastscreen", "active_flag", "status_flag" from loan where delete_flag = 'N' and 
         id = '${id}' group by "lastscreen", "active_flag", "status_flag"`,
      );
      if (rawData[0]['count'] > 0) {
        const data = {};
        if (
          rawData[0]['active_flag'] == 'N' &&
          rawData[0]['status_flag'] == 'waiting'
        ) {
          data['from_details'] = await entityManager.query(
            "select t.*, t2.ref_no as user_ref from customer t join user t2  on t2.id = t.user_id where t.loan_id = '" +
              id +
              "'",
          );
          data['document'] = await (await viewDocument.getDocument(id)).data;
          data['userDocument'] = await (await viewDocument.getUserDocument(id))
            .data;
        }
        data['lastscreen'] = rawData[0].lastscreen;
        return { statusCode: 200, data: data };
      } else {
        return { statusCode: 403, data: [], message: "Don't have permission" };
      }
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        message: ['This Loan Id Not Exists'],
        error: 'Bad Request',
      };
    }
  }

  async updateUserDetails(id, updateUserName: UpdateUserName, ip) {
    try {
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(updateUserName.password, salt);
      const entityManager = getManager();
      const logRawData = await entityManager.query(
        `select user_id from loan where id = '${id}'`,
      );
      function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;
        return re.test(String(email).toLowerCase());
      }
      if (!validateEmail(updateUserName.email)) {
        return {
          statusCode: 400,
          message: 'Please provide a valid email address',
          error: 'Bad Request',
        };
      }
      await this.customerRepository.update(
        { loan_id: id },
        {
          firstname: updateUserName.firstname,
          middlename: updateUserName.middlename,
          lastname: updateUserName.lastname,
          phone: updateUserName.phoneno,
          email: updateUserName.email,
          streetaddress: updateUserName.streetaddress,
          city: updateUserName.city,
          unit: updateUserName.unit,
          socialsecuritynumber: updateUserName.socialsecuritynumber,
          sourceofincome: updateUserName.sourceofincome,
          netmonthlyincome: updateUserName.netmonthlyincome,
          payfrequency: updateUserName.payfrequency,
          dayofmonth: updateUserName.dayofmonth,
          paidformat: updateUserName.paidformat,
          password: hashPassword,
        },
      );
      await this.userRepository.update(
        { _id: logRawData[0].user_id },
        {
          password: hashPassword,
          salt:salt
        },
      );
      await this.loanRepository.update({ id: id }, { lastscreen: 'loan' });
      const cs = new commonService(this.logRepository);
      cs.addLogs(id, 'Update Customer Details ' + ' ' + ip);
      return { statusCode: 200, data: 'User data saved sucessfully' };
    } catch (error) {
      const errorMessage = error.name + '   ' + error.message;
      const cs = new commonService(this.logRepository);
      cs.errorLogs(id, 'Update Customer Details ' + ' ' + ip, errorMessage);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async selectLoan(id, ip) {
    try {
      await this.loanRepository.update({ id: id }, { lastscreen: 'bank' });
      const cs = new commonService(this.logRepository);
      cs.addLogs(id, 'Update Loan Details ' + ' ' + ip);
      return { statusCode: 200 };
    } catch (error) {
      const errorMessage = error.name + '   ' + error.message;
      const cs = new commonService(this.logRepository);
      cs.errorLogs(id, 'Update Customer Details ' + ' ' + ip, errorMessage);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async bankManual(id, ip) {
    try {
      this.loanRepository.update({ id: id }, { lastscreen: 'document' });
      const cs = new commonService(this.logRepository);
      cs.addLogs(id, 'Update Bank Details ' + ' ' + ip);
      return { statusCode: 200 };
    } catch (error) {
      const errorMessage = error.name + '   ' + error.message;
      const cs = new commonService(this.logRepository);
      cs.errorLogs(id, 'Update Bank Details ' + ' ' + ip, errorMessage);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
}
