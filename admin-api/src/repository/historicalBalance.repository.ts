import { EntityRepository, Repository } from 'typeorm';
import {HistoricalBalanceEntity} from '../entities/historicalBalance.entity'
@EntityRepository(HistoricalBalanceEntity)
export class HistoricalBalanaceRepository extends Repository<HistoricalBalanceEntity> {
 
}   