import { EntityRepository, Repository } from 'typeorm';
import { PaymentscheduleEntity } from '../entities/paymentschedule.entity';

@EntityRepository(PaymentscheduleEntity)
export class PaymentscheduleRepository extends Repository<
  PaymentscheduleEntity
> {}
