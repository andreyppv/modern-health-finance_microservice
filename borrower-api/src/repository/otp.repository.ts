import { OtpEntity } from 'src/entities/otp.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(OtpEntity)
export class OtpRepository extends Repository<OtpEntity> {
 
}