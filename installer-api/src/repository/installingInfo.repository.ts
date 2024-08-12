
import { InstallingInfo } from 'src/entities/installingInfo.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(InstallingInfo)
export class InstallingInfoRepository extends Repository<InstallingInfo> {
 
}
