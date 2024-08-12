import {
    Controller,
    Post,
    UploadedFiles,
    UseInterceptors,
    Body,
    Get,
    Param,
    HttpStatus, HttpCode,
    Res
  } from '@nestjs/common';
  import { Response } from 'express';
  import {  ApiOperation } from '@nestjs/swagger';
  import { S3 } from 'aws-sdk';
  import { FilesService } from './files.service';
  import { config } from 'dotenv';
  config();
  
  @Controller('files')
  export class FilesController {
    constructor(private readonly filesService: FilesService) {}

  @Get('/download/:name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Download Files' })
  async getdetails(@Param('name') name: string, @Res() res: Response) {
    const s3 = this.getS3();
    const bucketS3 = process.env.S3BUCKET;//'modernhealth-staging';
    const params = {
      Bucket: bucketS3,
      Key:  process.env.awsS3ChildFolderPath + String(name),
    };

    s3.getObject(params, function(err, data) {
      if (err) {
        // cannot get file, err = AWS error response,
        // return json to client
        return {
          success: false,
          error: err,
        };
      } else {
        //sets correct header (fixes your issue )
        //if all is fine, bucket and file exist, it will return file to client
        const stream = s3
          .getObject(params)
          .createReadStream()
          .pipe(res);
      }
    });
  }

  @Get('/download/:id/:name')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Download Files with Id' })
  async getimgdetails(@Param('id') id: string,@Param('name') name: string,@Res() res: Response) {
    const s3 = this.getS3();
    const bucketS3 = process.env.S3BUCKET;//'modernhealth-staging';
    const params = {
      Bucket: bucketS3,
      Key: process.env.awsS3ChildFolderPath + String(id) +'/' +String(name),
    };

    s3.getObject(params, function(err, data) {
      if (err) {
        // cannot get file, err = AWS error response,
        // return json to client
        return {
          success: false,
          error: err,
        };
      } else {
        //sets correct header (fixes your issue )
        //if all is fine, bucket and file exist, it will return file to client
        const stream = s3
          .getObject(params)
          .createReadStream()
          .pipe(res);
      }
    });
  }
  /*
    @Get('/download/:name')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Download Files" })
    async getdetails(
      @Param('name') name: string,
      @Res() res: Response
    ){
      const s3 = this.getS3();
      const bucketS3 = process.env.S3BUCKET;
      const params = {
          Bucket: bucketS3,
          Key: process.env.awsS3ChildFolderPath+String(name)
      };
      
      s3.getObject(params, function(err, data) {
        if (err) {
          // cannot get file, err = AWS error response, 
          // return json to client
          return {
            success: false,
            error: err
          };
        } else {
           //sets correct header (fixes your issue ) 
          //if all is fine, bucket and file exist, it will return file to client
          const stream =  s3.getObject(params)
          .createReadStream()
          .pipe(res)       
        }
      });
    }
  */
  
    getS3() {
      return new S3({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });
    }  
  }
  