import { EntityRepository, Repository } from 'typeorm';
import { LoanOffersEntity } from '../entities/loanOffers.entity';

@EntityRepository(LoanOffersEntity)
export class LoanOffersRepository extends Repository<LoanOffersEntity> {}
