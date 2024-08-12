import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Loan } from '../../entities/loan.entity';
import { LoanRepository } from '../../repository/loan.repository';
import { startApplication } from './dto/startApplication.dto';

import { UserRepository } from '../../repository/users.repository';
import { UserConsentRepository } from '../../repository/userConsent.repository';
import { CustomerRepository } from '../../repository/customer.repository';

import { UserEntity, UsersRole } from '../../entities/users.entity';
import { CustomerEntity } from '../../entities/customer.entity';
import * as bcrypt from 'bcrypt';
import { MailService } from '../../mail/mail.service';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import { PaymentcalculationService } from '../../paymentcalculation/paymentcalculation.service';
import { getManager } from 'typeorm';
import { userConsentEnity } from 'src/entities/userConsent.entity';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class StartapplicationService {
  constructor(
    @InjectRepository(UserConsentRepository)
    private readonly userConsentRepository: UserConsentRepository,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
    @InjectSendGrid() private readonly client: SendGridService,
    private readonly rolesService: RolesService,
  ) {}

  async create(startapplication: startApplication) {
    const userEntity = new UserEntity();
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash('welcome', salt);
    userEntity.salt = salt;
    userEntity.password = hashPassword;

    const customerEntity = new CustomerEntity();
    function validateEmail(email) {
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;
      return re.test(String(email).toLowerCase());
    }

    const checkExistingEmail = await this.customerRepository.find({
      select: ['id'],
      where: { email: startapplication.email },
    });
    // console.log('checkExistingEmail---->', checkExistingEmail);
    if (checkExistingEmail.length > 0) {
      return {
        statusCode: 400,
        message: 'Email ID is already exists.',
        error: 'Bad Request',
      };
    }
    if (startapplication.email.trim().length == 0) {
      return {
        statusCode: 400,
        message: 'email should not be empty',
        error: 'Bad Request',
      };
    } else {
      if (validateEmail(startapplication.email)) {
        userEntity.email = startapplication.email;
        customerEntity.email = startapplication.email;
      } else {
        return {
          statusCode: 400,
          message: 'Please provide a valid email address',
          error: 'Bad Request',
        };
      }
    }

    if (startapplication.firstname.trim().length == 0) {
      return {
        statusCode: 400,
        message: 'firstname should not be empty',
        error: 'Bad Request',
      };
    } else {
      userEntity.firstname = startapplication.firstname;
      customerEntity.firstname = startapplication.firstname;
    }

    if (startapplication.lastname.trim().length == 0) {
      return {
        statusCode: 400,
        message: 'lastname should not be empty',
        error: 'Bad Request',
      };
    } else {
      userEntity.lastname = startapplication.lastname;
      customerEntity.lastname = startapplication.lastname;
    }

    customerEntity.middlename = startapplication.middlename;

    if (startapplication.socialsecuritynumber.trim().length == 0) {
      return {
        statusCode: 400,
        message: 'socialsecuritynumber should not be empty',
        error: 'Bad Request',
      };
    } else {
      customerEntity.socialsecuritynumber =
        startapplication.socialsecuritynumber;
    }

    // if (startapplication.birthday.trim().length == 0) {
    //   return {
    //     statusCode: 400,
    //     message: 'birthday should not be empty',
    //     error: 'Bad Request',
    //   };
    // } else {
    customerEntity.birthday = startapplication.birthday;
    // }

    if (startapplication.practiceid.trim().length == 0) {
      return {
        statusCode: 400,
        message: 'birthday should not be empty',
        error: 'Bad Request',
      };
    } else {
      customerEntity.practiceid = startapplication.practiceid;
    }

    customerEntity.monthlyincome = startapplication.monthlyincome;

    if (startapplication.phone.trim().length == 0) {
      return {
        statusCode: 400,
        message: 'phone should not be empty',
        error: 'Bad Request',
      };
    } else {
      customerEntity.phone = startapplication.phone;
    }

    if (startapplication.streetaddress.trim().length == 0) {
      return {
        statusCode: 400,
        message: 'streetaddress should not be empty',
        error: 'Bad Request',
      };
    } else {
      customerEntity.streetaddress = startapplication.streetaddress;
    }

    if (startapplication.unit.trim().length == 0) {
      return {
        statusCode: 400,
        message: 'unit should not be empty',
        error: 'Bad Request',
      };
    } else {
      customerEntity.unit = startapplication.unit;
    }
    customerEntity.unit = startapplication.unit;
    if (startapplication.city.trim().length == 0) {
      return {
        statusCode: 400,
        message: 'city should not be empty',
        error: 'Bad Request',
      };
    } else {
      customerEntity.city = startapplication.city;
    }

    if (startapplication.state.trim().length == 0) {
      return {
        statusCode: 400,
        message: 'state should not be empty',
        error: 'Bad Request',
      };
    } else {
      customerEntity.state = startapplication.state;
    }

    if (startapplication.zipcode.trim().length == 0) {
      return {
        statusCode: 400,
        message: 'zipcode should not be empty',
        error: 'Bad Request',
      };
    } else {
      customerEntity.zipcode = startapplication.zipcode;
    }

    if (startapplication.typeofresidence.trim().length == 0) {
      return {
        statusCode: 400,
        message: 'zipcode should not be empty',
        error: 'Bad Request',
      };
    } else {
      customerEntity.typeofresidence = startapplication.typeofresidence;
    }

    customerEntity.housingexpense = startapplication.housingexpense;

    // if (startapplication.loanamount == 0) {
    //   return {
    //     statusCode: 400,
    //     message: 'loanamount should not be 0',
    //     error: 'Bad Request',
    //   };
    // } else {
    //   customerEntity.loanamount = startapplication.loanamount;
    // }

    // if (startapplication.loanterm == 0) {
    //   return {
    //     statusCode: 400,
    //     message: 'loanterm should not be 0',
    //     error: 'Bad Request',
    //   };
    // } else {
    //   customerEntity.loanterm = startapplication.loanterm;
    // }

    // if (startapplication.apr == 0) {
    //   return {
    //     statusCode: 400,
    //     message: 'apr should not be 0',
    //     error: 'Bad Request',
    //   };
    // } else {
    //   customerEntity.apr = startapplication.apr;
    // }

    try {
      // const getRoleID = await this.rolesService.getCustomerPortalRoles();
      let userid: any = await this.userRepository.find({
        select: ['_id'],
        where: { email: userEntity.email, role: 2 },
      });
      // console.log('UserId',userid)
      if (userid.length == 0) {
        userid = await this.userRepository.save(userEntity);
        // console.log('Save User',userid)
        userid = userid.id;
      } else {
        userid = userid[0].id;
      }
      customerEntity.user_id = userid;

      const newloan = new Loan();

      newloan.user_id = userid;
      // const payment = new PaymentcalculationService();
      // const monthlypayment = payment.findPaymentAmount(
      //   startapplication.loanamount,
      //   startapplication.apr,
      //   startapplication.loanterm,
      // );
      // newloan.monthlypayment = monthlypayment;
      const loan = await this.loanRepository.save(newloan);

      customerEntity.loan_id = loan.id;
      // customerEntity.monthlypayment = monthlypayment;
      await this.customerRepository.save(customerEntity);
      // if (startapplication.enablingMail == true) {
      //   const service = new MailService(this.client);
      //   service.mail(loan.id, 'Welcome');
      // }
      const service = new MailService(this.client);
      service.mail(loan.id, 'Welcome');
      return { statusCode: 200, Loan_ID: customerEntity.loan_id };
    } catch (error) {
      console.log('error---->', error);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async getConsentList() {
    const entityManager = getManager();
    const rawdata = await entityManager.query(
      `select id_consent,"filename","filekey" from consentmaster where "filekey" in (120,125,126,132)`,
    );
    return rawdata;
  }
  async saveUserConsent(saveData: any) {
    try {
      // console.log(saveData);
      const responseData = await this.userConsentRepository.save(saveData);
      // console.log(responseData);
      return responseData;
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
}
