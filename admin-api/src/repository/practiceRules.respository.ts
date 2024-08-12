import { PracticeRulesEntity } from 'src/entities/practiceRules.entity';
import { EntityRepository, Repository } from 'typeorm';
@EntityRepository(PracticeRulesEntity)
export class PracticeRulesRepository extends Repository<PracticeRulesEntity> {}
