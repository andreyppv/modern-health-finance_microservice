import { Logger, InternalServerErrorException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
const pupeetree = require('puppeteer');
import { extname } from 'path';
import { config } from 'dotenv';
import { LogEntity } from '../entities/log.entity';
import { LogRepository } from '../repository/log.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager } from 'typeorm';
import { RealIP } from 'nestjs-real-ip';

config();
export class commonService {
  constructor(
    @InjectRepository(LogRepository)
    private readonly logRepository: LogRepository,
  ) {}

  async convertHTMLToPDF(loan_id, htmlContent, name) {
    const browser = await pupeetree.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    const data = await await page.pdf({
      path: 'myPdf.pdf',
      format: 'a4',
      printBackground: true,
    });

    await browser.close();

    const bucketS3 = process.env.bucketS3;
    let fileName = `${process.env.awsS3ChildFolderPath}${name}-${loan_id}.pdf`;
    const data1: any = await this.uploadS3(data, bucketS3, fileName);
    return data1;
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

  async addLogs(loan_id, message) {
    const entityManager = getManager();
    try {
      const getUserID = await entityManager.query(
        `select user_id from loan where id = '${loan_id}'`,
      );
      const logEntity = new LogEntity();
      logEntity.loan_id = loan_id;
      logEntity.user_id = getUserID[0].user_id;
      logEntity.module = message;
      await this.logRepository.save(logEntity);
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }

  async errorLogs(loan_id, message, error) {
    const entityManager = getManager();
    try {
      const getUserID = await entityManager.query(
        `select user_id from loan where id = '${loan_id}'`,
      );
      const logEntity = new LogEntity();
      logEntity.loan_id = loan_id;
      logEntity.error = error;
      logEntity.user_id = getUserID[0].user_id;
      logEntity.module = message;
      await this.logRepository.save(logEntity);
    } catch (error) {
      return {
        statusCode: 500,
        message: [new InternalServerErrorException(error)['response']['name']],
        error: 'Bad Request',
      };
    }
  }
}
