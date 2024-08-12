import { EntityRepository, Repository } from 'typeorm';
import {PracticeEntity} from '../entities/practice.entity'

@EntityRepository(PracticeEntity)
export class PracticeRepository extends Repository<PracticeEntity>{
    
}