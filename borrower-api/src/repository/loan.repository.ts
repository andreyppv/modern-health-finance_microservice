import { EntityRepository, Repository } from 'typeorm';
import { Loan } from '../entities/loan.entity';

@EntityRepository(Loan)
export class LoanRepository extends Repository<Loan> {
 
}