import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerRepository } from 'src/repository/customer.repository';
import { PaymentScheduleRepository } from 'src/repository/paymentSchedule.repository';
import { getManager } from 'typeorm';


@Injectable()
export class PaymentDetailsService {

    constructor(
        @InjectRepository(PaymentScheduleRepository) private readonly paymentScheduleRepository: PaymentScheduleRepository,
        @InjectRepository(CustomerRepository) private readonly customerRepository: CustomerRepository
    ) { }

    async getPaymentDetails(id) {
        const entityManager = getManager();
        try {
            let data = {}
            // data['payment_details'] = await this.paymentScheduleRepository.find({ where: { loan_id: id, status_flag: 'PAID' }, order: { scheduledate: 'DESC' } });
            // data['next_schedule'] = await this.paymentScheduleRepository.findOne({ where: { loan_id: id, status_flag: 'UNPAID' }, order: { scheduledate: 'ASC' } });
            // data['user_details'] = await this.customerRepository.findOne({ select: ['autopayment'], where: { loan_id: id } });
            // data['paymentScheduleDetails'] = await this.paymentScheduleRepository.find({ where: { loan_id: id }, order: { scheduledate: 'ASC' } });
            data['payment_details'] = await entityManager.query(`
                SELECT T.*,
                    t1._id ID 
                FROM
                    "paymentschedulehistory" T LEFT JOIN paymentmanagement t1 ON T.loanreference = t1.loanreference 
                WHERE
                    t1._id = '${id}'
            `)[0];
            console.log(data);
            return { "statusCode": 200, data: data };
        } catch (error) {
            return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
        }
    }

    async getloandata(id) {
        console.log('loan detail',id)
        const entityManager = getManager();
        let loandata = {}
        loandata = await entityManager.query(`select * from paymentmanagement t 
        join public.user u on t.user = u._id
        where t._id= '${id}'`)
        return { "statusCode": 200, data: loandata };
    }

}
