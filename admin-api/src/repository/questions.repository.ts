
import { EntityRepository, Repository } from 'typeorm';
import { Questions } from '../entities/question.entity';

@EntityRepository(Questions)
export class QuestionsRepository extends Repository<Questions> {
 
}
