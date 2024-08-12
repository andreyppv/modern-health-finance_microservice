import { EntityRepository, Repository } from 'typeorm';
import { OtpEntity } from '../entities/otp.entity';

@EntityRepository(OtpEntity)
export class OTPRepository extends Repository<OtpEntity> {}
