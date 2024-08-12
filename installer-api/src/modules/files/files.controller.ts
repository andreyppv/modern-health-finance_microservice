import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  Body,
  Get,
  Param,
  HttpStatus, HttpCode,
  Res,UseGuards
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
  import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
  import { RolesGuard } from '../../guards/roles.guard';
  import { SetMetadata } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { FilesService } from './files.service';
import { config } from 'dotenv';
config();
export const Roles = (...roles: string[]) => SetMetadata('role', roles);

@ApiTags('Files')
@ApiBearerAuth()
@Roles('installer')
@UseGuards(AuthGuard('jwt'),RolesGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

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


  getS3() {
    return new S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }  
}
