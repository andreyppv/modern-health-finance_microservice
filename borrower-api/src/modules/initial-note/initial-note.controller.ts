import {
  Controller,
  HttpStatus,
  HttpCode,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { extname } from 'path';
import { Logger } from '@nestjs/common';
import { S3 } from 'aws-sdk';
const pupeetree = require('puppeteer');
import { userConsentEnity } from '../../entities/userConsent.entity';
import { config } from 'dotenv';
config();

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
    return callback(
      {
        statusCode: 400,
        message: 'Only jpg,jpeg,png,pdf are allowed!',
        error: 'Bad Request',
      },
      false,
    );
    //return callback(new Error('Only jpg,jpeg,png,pdf are allowed!'), false);
  }
  callback(null, true);
};import { InitialNoteService } from './initial-note.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {Save} from './dto/save.dto'




@ApiTags('Initial-note')
@Controller('initial-note')
export class InitialNoteController {
  constructor(private readonly initialNoteService: InitialNoteService) {}

  @Get('/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get Initial-note" })
    async get(
      @Param('id', ParseUUIDPipe) id: string
    ){
        return this.initialNoteService.get(id);
    }

    @Post('/save')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Initial-note Save" })
    async save(
      @Body() save:Save
    ){
      let html = await this.initialNoteService.savePromissoryNote(save.loan_id,save.signature,save.date);
      try {
        
        if(html.statusCode==200){
          let data = await this.PromissoryNoteGenerate(save.loan_id, html.data);
          return this.initialNoteService.save(save,data)
        }else{
          return html;
        }
        
      } catch (e) {
        return {
          message: 'error',
          statusCode: 400,
        };
      }
     
    }


    async PromissoryNoteGenerate(loan_id: string, html: string) {
      var consentDoc = html;
      const browser = await pupeetree.launch();
      const page = await browser.newPage();
      await page.setContent(consentDoc);
  
      let data = await page.pdf({
        path: 'myPdf.pdf',
        format: 'a4',
        printBackground: true,
      });
      
      const bucketS3 = process.env.S3BUCKET;
      let fileName = 'mypdf.pdf';
      const name = fileName.split('.')[0];
      const fileExtName = extname(fileName);
      const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      fileName = `${process.env.awsS3ChildFolderPath}PromissoryNote-${loan_id}${fileExtName}`;
      let data1: any = await this.uploadS3(data, bucketS3, fileName);
      let consentEntity = new userConsentEnity();
      if (Object.keys(data1).length > 0 && data1.Location != undefined) {
        consentEntity.loanid = loan_id;
        consentEntity.filekey = 105;
        consentEntity.filepath = fileName;
      }
      browser.close()
      return consentEntity;
    }

    async uploadS3(file, bucket, name) {
      const s3 = this.getS3();
      const params = {
        Bucket: bucket,
        Key: String(name),
        Body: file,
      };
      return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
          if (err) {
            Logger.error(err);
            reject(err.message);
          }
          resolve(data);
        });
      });
    }
  
    getS3() {
      return new S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });
    }
}
