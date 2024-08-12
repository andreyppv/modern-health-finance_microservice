import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager } from 'typeorm';
import { config } from 'dotenv';

import {
  offerTypeFlags,
  LoanOffersEntity,
  Flags as offerFlags,
} from '../../entities/loanOffers.entity';
import { LoanOffersRepository } from '../../repository/loanOffers.repository';
import { UpdateOfferDto, CreateOfferDto } from './dto/loanoffers.dto';
import { PaymentcalculationService } from '../paymentcalculation/paymentcalculation.service';
import { MailService } from '../../mail/mail.service';
config();

@Injectable()
export class LoanoffersService {
  constructor(
    @InjectRepository(LoanOffersRepository)
    private readonly loanOffersRepository: LoanOffersRepository,
    private readonly mailService: MailService,
  ) {}
  async getAll(loan_id: string) {
    const entityManager: any = getManager();
    try {
      let result: any = await entityManager.query(
        `select * from loanoffers 
        where delete_flag = 'N' and loan_id = '${loan_id}'`,
      );
      return {
        statusCode: 200,
        data: result,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async delete(offer_id: string) {
    const entityManager: any = getManager();
    try {
      let checkInfo: any = await entityManager.query(
        `select * from loanoffers where id = '${offer_id}'`,
      );
      if (checkInfo.length > 0) {
        let result: any = await entityManager.query(
          `update loanoffers set delete_flag = 'Y'
          where delete_flag = 'N' and id = '${offer_id}'`,
        );
        let offers = await this.getAll(checkInfo[0].loan_id);
        return {
          statusCode: 200,
          message: ['Successfully offer deleted'],
          data: offers['data'],
        };
      } else {
        return {
          statusCode: 400,
          message: ['Offer Id is invaild'],
        };
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async create(createOffer: CreateOfferDto) {
    try {
      let calc = new PaymentcalculationService();
      let monthlyAmt = calc.findPaymentAmount(
        createOffer.financialAmount,
        createOffer.interestRate,
        createOffer.duration,
      );
      let loanOffers = new LoanOffersEntity();
      loanOffers.financialamount = createOffer.financialAmount;
      loanOffers.monthlyamount = monthlyAmt;
      loanOffers.interestrate = createOffer.interestRate;
      loanOffers.duration = createOffer.duration;
      loanOffers.offertype = offerTypeFlags.GeneratedByAdmin;
      loanOffers.loan_id = createOffer.loan_id;
      loanOffers.originationfee = createOffer.originationFee;
      await this.loanOffersRepository.save(loanOffers);
      let offers = await this.getAll(createOffer.loan_id);
      return {
        statusCode: 200,
        message: ['Successfully offer saved'],
        data: offers['data'],
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async update(updateOffer: UpdateOfferDto) {
    try {
      let calc = new PaymentcalculationService();
      let monthlyAmt = calc.findPaymentAmount(
        updateOffer.financialAmount,
        updateOffer.interestRate,
        updateOffer.duration,
      );
      let loanOffers = new LoanOffersEntity();
      loanOffers.financialamount = updateOffer.financialAmount;
      loanOffers.monthlyamount = monthlyAmt;
      loanOffers.interestrate = updateOffer.interestRate;
      loanOffers.duration = updateOffer.duration;
      loanOffers.offertype = offerTypeFlags.GeneratedByAdmin;
      loanOffers.originationfee = updateOffer.originationFee;
      await this.loanOffersRepository.update(
        { id: updateOffer.offer_id, loan_id: updateOffer.loan_id },
        loanOffers,
      );
      let offers = await this.getAll(updateOffer.loan_id);
      return {
        statusCode: 200,
        message: ['Successfully offer Updated'],
        data: offers['data'],
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
  async send_offer(loan_id: string) {
    try {
      const entityManager: any = getManager();
      let loanInfo: any = await entityManager.query(
        `SELECT u.email,l.* FROM loan l
        join user u on u.id=l.user_id and u.delete_flag = 'N' 
        WHERE l.id='${loan_id}'
        and (l.status_flag='underwriting' or l.status_flag = 'waiting' or l.status_flag='offerfailed')
        and l.delete_flag = 'N' and l.denied_flag = 'N'`,
      );
      if (loanInfo.length > 0) {
        let offers = await entityManager.query(
          `select * from loanoffers where loan_id = '${loan_id}' and delete_flag = 'N'`,
        );
        if (offers.length == 0) {
          return {
            statusCode: 400,
            message: ['Offer is not created'],
          };
        }
        await entityManager.query(
          `update loan set status_flag = 'waiting' where id='${loan_id}'`,
        );
        let url =
          process.env.BusinessWarriorUrl + 'shortForm/eligibleOffer/' + loan_id;
        // await this.mailService.send_offers_mail(loanInfo[0].email, url);
        return {
          statusCode: 200,
          message: ['Successfully offer email sent'],
        };
      } else {
        return {
          statusCode: 400,
          message: ['Loan is invaild'],
        };
      }
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
}
