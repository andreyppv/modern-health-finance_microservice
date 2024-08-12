
import { EntityRepository, Repository } from 'typeorm';
import { FilesEntity } from '../entities/files.entity';

@EntityRepository(FilesEntity)
export class FilesRepository extends Repository<FilesEntity> {
 
}
