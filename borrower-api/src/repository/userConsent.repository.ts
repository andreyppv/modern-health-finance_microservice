import { EntityRepository, Repository } from 'typeorm';
import { userConsentEnity } from '../entities/userConsent.entity';

@EntityRepository(userConsentEnity)
export class userConsentRepository extends Repository<userConsentEnity> {

}