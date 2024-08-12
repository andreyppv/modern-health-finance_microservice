import { TokenEntity } from '../entities/token.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(TokenEntity)
export class TokenRepository extends Repository<TokenEntity> {}
