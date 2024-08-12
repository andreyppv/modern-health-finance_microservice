
import { SystemInfo } from 'src/entities/systemInfo.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(SystemInfo)
export class SystemInfoRepository extends Repository<SystemInfo> {
 
}
