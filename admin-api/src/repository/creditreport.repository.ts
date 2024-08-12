
import { EntityRepository, Repository } from 'typeorm';
import { Creditreport } from '../entities/creditreport.entity';

@EntityRepository(Creditreport)
export class CreditreportRepository extends Repository<Creditreport> {
 
}
