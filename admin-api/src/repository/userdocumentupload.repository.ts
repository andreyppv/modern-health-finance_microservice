import { EntityRepository, Repository } from 'typeorm';
import { uploadUserDocument } from '../entities/uploaduserdocument.entity';

@EntityRepository(uploadUserDocument)
export class UploadUserDocumentRepository extends Repository<
  uploadUserDocument
> {}
