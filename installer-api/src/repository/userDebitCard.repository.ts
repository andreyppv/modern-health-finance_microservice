import { EntityRepository, Repository } from 'typeorm';
import { UserDebitCard } from '../entities/userDebitCard.entity';

@EntityRepository(UserDebitCard)
export class UserDebitCardRepository extends Repository<UserDebitCard> {
 
}