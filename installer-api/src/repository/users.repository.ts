import { EntityRepository, Repository } from 'typeorm';
import { UserEntity } from '../entities/users.entity';

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
 
}