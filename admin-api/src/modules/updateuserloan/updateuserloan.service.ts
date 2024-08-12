import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UpdateUserLoanAmount } from '../updateuserloan/dto/update-updateuserloan.dto';
import { CustomerRepository } from '../../repository/customer.repository';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UpdateuserloanService {
  constructor(
    @InjectRepository(CustomerRepository)
    private readonly customerRepository: CustomerRepository,
  ) {}
  async editUserLoanAmountDetails(
    id,
    updateUserLoanAmount: UpdateUserLoanAmount,
  ) {
    try {
      await this.customerRepository.update(
        { loan_id: id },
        {
          loanamount: updateUserLoanAmount.loanamount,
          apr: updateUserLoanAmount.apr,
          loanterm: updateUserLoanAmount.duration,
        },
      );
      return { statusCode: 200, data: 'Update user loan details successfully' };
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
}
