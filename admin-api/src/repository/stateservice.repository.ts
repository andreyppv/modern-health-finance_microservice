import { EntityRepository, Repository } from 'typeorm';
import { stateservice } from '../entities/stateservice.entity';

@EntityRepository(stateservice)
export class StateserviceRepository extends Repository<stateservice> {}
