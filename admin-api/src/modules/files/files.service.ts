import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUploadDto } from './dto/create-upload.dto';
import { FilesRepository } from '../../repository/files.repository';
import { FilesEntity } from '../../entities/files.entity';
import { LoanRepository } from '../../repository/loan.repository';
import { getManager } from 'typeorm';

export enum Flags {
  Y = 'Y',
}

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FilesRepository)
    private readonly filesRepository: FilesRepository,
    @InjectRepository(LoanRepository)
    private readonly loanRepository: LoanRepository,
  ) {}

  async save(files, createUploadDto: CreateUploadDto) {
    // console.log("filenk", files, createUploadDto);
    let filedata = [];
    for (let i = 0; i < files.length; i++) {
      const file: FilesEntity = new FilesEntity();
      file.originalname = files[i].originalname;
      file.filename = files[i].filename;
      // file.services = files[i].services;
      file.services = createUploadDto.services[i];
      file.link_id = createUploadDto.link_id;
      filedata.push(file);
    }
    try {
      for(let j=0;j<createUploadDto.services.length;j++){
        if(createUploadDto.services[j]!= undefined){
          await this.filesRepository.update({link_id: createUploadDto.link_id,services:createUploadDto.services[j]},
            {delete_flag: Flags.Y })
        }
      }
            
      await this.filesRepository.save(filedata);
      let data = {};
      // await this.loanRepository.update({id: createUploadDto.link_id}, { active_flag: Flags.Y });
      data['files'] = await this.filesRepository.find({
        where: { link_id: createUploadDto.link_id, delete_flag: 'N' },
      });
      return { statusCode: 200, Loan_ID: createUploadDto.link_id, data: data };
    } catch (error) {
      // console.log("errbe",error)
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async getPracticeLogoDetails(id: string) {
    const entityManager = getManager();
    try {
      const data = await entityManager.query(
        `select originalname,filename from files where link_id = '${id}' and delete_flag='N' and services='practiceMangement/practiceLogo'`,
      );
      // console.log("d1",data);
      return { statusCode: 200, data: data };
    } catch (err) {
      // console.log(err);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(err)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async getPracticePoweredByLogoDetails(id: string) {
    const entityManager = getManager();
    try {
      const data = await entityManager.query(
        `select originalname,filename from files where link_id = '${id}' and delete_flag='N' and services='practiceMangement/practicePoweredByLogo'`,
      );
      // console.log("d2",data);
      return { statusCode: 200, data: data };
    } catch (err) {
      // console.log(err);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(err)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async deleteFiles(filename: string) {
    const entityManager = getManager();
    try {
      const data = await entityManager.query(
        `update files set delete_flag ='Y' where filename ='Development/mhfv2/${filename}'`,
      );
      return { statusCode: 200, data: data };
    } catch (err) {
      // console.log(err);
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(err)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
}
