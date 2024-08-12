import { EntityRepository, Repository } from 'typeorm';
import { aggrementEnity } from '../entities/aggrement.entity';

@EntityRepository(aggrementEnity)
export class AggrementRepository extends Repository<aggrementEnity> {}
