import { Installer } from 'src/entities/installer.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Installer)
export class InstallerRepository extends Repository<Installer> {
 
}