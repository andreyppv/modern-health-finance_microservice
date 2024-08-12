
import { PlaidAccessTokenMaster } from 'src/entities/plaidAccessTokenMaster.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(PlaidAccessTokenMaster)
export class PlaidAccessTokenMasterRepository extends Repository<PlaidAccessTokenMaster> {
 
}