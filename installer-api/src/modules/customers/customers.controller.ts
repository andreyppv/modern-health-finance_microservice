import { Controller, Get, Post, HttpCode, UseInterceptors, Body,
            UploadedFiles, HttpStatus, ParseUUIDPipe, Param,UseGuards, Put,
            Res 
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { extname } from "path";
import { S3 } from 'aws-sdk';
import { Logger } from '@nestjs/common';
import { CreateUploadDto } from './dto/createUpload.dto';
import { SystemInfoDto } from './dto/systemInfo.dto';
import { AddCommentDto } from './dto/comment.dto';
import { Milestone1ReqDto, Milestone2ReqDto, Milestone3ReqDto } from './dto/installingInfo.dto';
import { Response } from 'express';
import { config } from 'dotenv';
import { Next } from './dto/next.dto';
config();


export const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
      return callback({"statusCode": 400, "message": "Only jpg,jpeg,png,pdf are allowed!","error": "Bad Request"}, false);
      //return callback(new Error('Only jpg,jpeg,png,pdf are allowed!'), false);
    }
    callback(null, true);
};

export const Roles = (...roles: string[]) => SetMetadata('role', roles);
@ApiBearerAuth()
@Roles('installer')
@UseGuards(AuthGuard('jwt'),RolesGuard)
@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService){}

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get All Customers list" })
    async getApplicationsList(@Param('id', ParseUUIDPipe) id: string){
        return this.customersService.getApplicationsList(id);
    }

    @Get('/getapplicationdetails/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get Application Details" })
    async getApplicationDetails(
        @Param('id', ParseUUIDPipe) id: string
    ){
        return this.customersService.getApplicationDetails(id);
    }

    @Post('fileupload')
    @UseInterceptors(
        FilesInterceptor('files[]', 20, {
            fileFilter: imageFileFilter,
        }),
    )
    async customerFileUpload(@UploadedFiles() files, @Body() createUploadDto: CreateUploadDto){
        let response = this.uploadMultipleFiles(files);
        return this.customersService.customerFileUpload(response,createUploadDto);
    }
    
    @Post('systeminfo')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Adding system info" })
    async systemInfoAdd(
        @Body() systemInfoDto:SystemInfoDto
    ){
        return this.customersService.systemInfoAdd(systemInfoDto)
    }

    @Post('nextstep')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Adding system info" })
    async nextstep(
        @Body() next:Next
    ){
        return this.customersService.nextstep(next)
    }

    @Post('addComment')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "milestone 3 pay" })
    async addComment(
        @Body() addCommentDto:AddCommentDto
    ){
        return this.customersService.addComment(addCommentDto);
    }

    @Post('milestone1req')
    @UseInterceptors(
        FilesInterceptor('files[]', 20, {
            fileFilter: imageFileFilter,
        }),
    )
    async milestone1Req(@UploadedFiles() files, @Body() milestone1ReqDto: Milestone1ReqDto){
        let response = this.uploadMultipleFiles(files);
        return this.customersService.milestone1Req(response,milestone1ReqDto);
    }

    @Post('milestone2req')
    @UseInterceptors(
        FilesInterceptor('files[]', 20, {
            fileFilter: imageFileFilter,
        }),
    )
    async milestone2Req(@UploadedFiles() files, @Body() milestone2ReqDto: Milestone2ReqDto){
        let response = this.uploadMultipleFiles(files);
        return this.customersService.milestone2Req(response,milestone2ReqDto);
    }

    @Post('milestone3req')
    @UseInterceptors(
        FilesInterceptor('files[]', 20, {
            fileFilter: imageFileFilter,
        }),
    )
    async milestone3Req(@UploadedFiles() files, @Body() milestone3ReqDto: Milestone3ReqDto){
        let response = this.uploadMultipleFiles(files);
        return this.customersService.milestone3Req(response,milestone3ReqDto);
    }

    @Get('projectdetails/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get Application Details" })
    async getProjectDetails(
        @Param('id', ParseUUIDPipe) id: string
    ){
        return this.customersService.getProjectDetails(id);
    }

    @Put('approveApplication/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "To approve application " })
    async toggleAutoPay(
        @Param('id') id: string
    ){        
        return this.customersService.approveApplication(id)
    }

    @Get('install-info/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get installed info details" })
    async installInfo(
        @Param('id', ParseUUIDPipe) id: string
    ){
        return this.customersService.installInfo(id);
    }

    @Get('files_verify/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get installed info details" })
    async files_verify(
        @Param('id', ParseUUIDPipe) id: string
    ){
        return this.customersService.files_verify(id);
    }

    uploadMultipleFiles(files) {
        const response = [];
        files.forEach(file => {
            const name = file.originalname.split('.')[0];
            const fileExtName = extname(file.originalname);
            const randomName = Array(4)
                .fill(null)
                .map(() => Math.round(Math.random() * 16).toString(16))
                .join('');
            file.filename = process.env.awsS3ChildFolderPath+`${name}-${randomName}${fileExtName}`
            const fileReponse = {
                originalname: file.originalname,
                filename: file.filename,
                DocumentType: file.documenttype
            };

            const bucketS3 = process.env.S3BUCKET;
            this.uploadS3(file.buffer, bucketS3, file.filename);
            response.push(fileReponse);
        });
        return response;
    }

    uploadS3(file, bucket, name) {
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
