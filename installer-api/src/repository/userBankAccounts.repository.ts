import { EntityRepository, Repository } from 'typeorm';
import { UserBankAccount } from '../entities/userBankAccount.entity';

@EntityRepository(UserBankAccount)
export class UserBankAccountRepository extends Repository<UserBankAccount> {
 
}