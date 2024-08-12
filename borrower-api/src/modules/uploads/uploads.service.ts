import { Injectable,InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUploadDto } from './dto/create-upload.dto';
import { FilesRepository } from '../../repository/files.repository';
import { FilesEntity } from '../../entities/files.entity';
import {LoanRepository} from '../../repository/loan.repository';
import { getManager } from 'typeorm';

export enum Flags {
  Y = 'Y'
}

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(FilesRepository) private readonly filesRepository: FilesRepository,
    @InjectRepository(LoanRepository) private readonly loanRepository: LoanRepository,
  ){

  }

  async getDocuments(id){
    const entityManager = getManager();
    try{
      let data = {}
      data["userConsentDoc"] = await entityManager.query(`
      SELECT
      ucon._id AS ID,
      ucon.paymentmanagement AS loanid,
      ucon.agreementpath AS filepath,
      ucon.documentkey filekey,
      conm.NAME 
    FROM
      userconsent ucon
      JOIN consentmaster conm ON conm.filekey = int4(ucon.documentkey) 
    WHERE
      ucon.paymentmanagement = '${id}'
      `)
      return { "statusCode": 200, "data": data}
    }catch(error){
      console.log(error)
          return {"statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request"};
      }
  }

  async save(files,createUploadDto: CreateUploadDto) {    
    let filedata = [];
    for (let i = 0; i < files.length; i++) {      
      let file:FilesEntity = new FilesEntity();
      file.originalname = files[i].originalname;
      file.filename = files[i].filename;
      file.services = 'borrower/upload';
      file.documenttype = createUploadDto.documentTypes[i];
      file.link_id = createUploadDto.loan_id;
      filedata.push(file)
    }
    try{
      await this.filesRepository.save(filedata);
      await this.loanRepository.update({id: createUploadDto.loan_id}, { active_flag: Flags.Y });
      return { "statusCode": 200, "Loan_ID": createUploadDto.loan_id}

    } catch (error) {
      console.log(error)
      return { "statusCode": 500, "message": [new InternalServerErrorException(error)['response']['name']], "error": "Bad Request" };
    }
  }
}
