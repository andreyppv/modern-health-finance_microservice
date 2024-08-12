import { BankTransactions } from '../entities/bankTransaction.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(BankTransactions)
export class BankTransactionsRepository extends Repository<BankTransactions> {}
