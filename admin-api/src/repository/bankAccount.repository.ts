import { BankAccounts } from '../entities/bankAccount.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(BankAccounts)
export class BankAccountsRepository extends Repository<BankAccounts> {}
