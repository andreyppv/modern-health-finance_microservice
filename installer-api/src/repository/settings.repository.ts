import { SettingsEntity } from 'src/entities/settings.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(SettingsEntity)
export class SettingsRepository extends Repository<SettingsEntity> {
 
}
