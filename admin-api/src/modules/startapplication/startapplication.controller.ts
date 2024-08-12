import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { StartapplicationService } from './startapplication.service';
import { startApplication } from './dto/startApplication.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import * as fs from 'fs';
import { S3 } from 'aws-sdk';
const pupeetree = require('puppeteer');
import { userConsentEnity } from '../../entities/userConsent.entity';
import { extname, join } from 'path';
import { config } from 'dotenv';
config();

export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@ApiTags('StartApplication')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('startapplication')
export class StartapplicationController {
  constructor(
    private readonly startapplicationService: StartapplicationService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Start Application' })
  async create(@Body() startapplication: startApplication) {
    const res = this.startapplicationService.create(startapplication);
    const userDetails = await res.then(data => data);
    // if (
    //   userDetails.statusCode == 200 &&
    //   userDetails.Loan_ID != 'undefined' &&
    //   userDetails.Loan_ID != null &&
    //   userDetails.Loan_ID
    // ) {
    //   this.automateUserConsentGenerate(userDetails.Loan_ID);
    // }
    return userDetails;
  }

  async automateUserConsentGenerate(loan_id: string) {
    const filepath = process.env.distRootPath;
    const consentData = [];
    const rawData = this.startapplicationService.getConsentList();
    const fileData = await rawData.then(data => data);
    for (let k = 0; k < fileData.length; k++) {
      const consentDoc = fs.readFileSync(
        `${filepath}/${fileData[k].filename}.html`,
        { encoding: 'utf-8', flag: 'r' },
      );
      const browser = await pupeetree.launch();
      const page = await browser.newPage();
      await page.setContent(consentDoc);

      const data = await await page.pdf({
        path: 'myPdf.pdf',
        format: 'a4',
        printBackground: true,
      });

      await browser.close();

      const bucketS3 = 'alchemylms-staging';
      const stateName = 'CA';
      let fileName = 'mypdf.pdf';
      const name = fileName.split('.')[0];
      const fileExtName = extname(fileName);
      const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      fileName = `${process.env.awsS3ChildFolderPath}${fileData[k].filename}-${loan_id}${fileExtName}`;
      const data1: any = await this.uploadS3(data, bucketS3, fileName);

      if (Object.keys(data1).length > 0 && data1.Location != undefined) {
        const consentEntity = new userConsentEnity();
        consentEntity.loanid = loan_id;
        consentEntity.filekey = fileData[k].filekey;
        consentEntity.filepath = fileName;
        consentData.push(consentEntity);
      }
    }
    await this.startapplicationService.saveUserConsent(consentData);
  }

  //upload File into S3 bucket
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
