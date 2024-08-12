import { OwnerInformation } from '../entities/ownerInformation.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(OwnerInformation)
export class OwnerInformationRepository extends Repository<OwnerInformation> {}
