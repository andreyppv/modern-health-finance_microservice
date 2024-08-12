import { EntityRepository, Repository } from 'typeorm';
import { CreditPull } from '../entities/creditPull.entity';

@EntityRepository(CreditPull)
export class CreditPullRepository extends Repository<CreditPull> {}
