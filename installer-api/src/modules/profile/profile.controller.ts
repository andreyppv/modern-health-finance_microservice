import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, ParseUUIDPipe, Post, Put, Res, SetMetadata, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { S3 } from 'aws-sdk';
import { extname } from 'path';
import { RolesGuard } from 'src/guards/roles.guard';
import { EditProfileDto, EditSubInstallerDto } from './dto/profile.dto';
import { ProfileService } from './profile.service';
import { Response } from 'express';
import { config } from 'dotenv';
config();

export const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback({"statusCode": 400, "message": "Only jpg,jpeg,png are allowed!","error": "Bad Request"}, false);
    }
    callback(null, true);
};

export const Roles = (...roles: string[]) => SetMetadata('role', roles);
@ApiBearerAuth()
@Roles('installer')
@UseGuards(AuthGuard('jwt'),RolesGuard)
@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService){}

    @Post('/editprofile')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "edit installer profile" })
    async editProfile(
        @Body() editProfileDto:EditProfileDto
    ){
        return this.profileService.editProfile(editProfileDto)
    }

    @Post('/editSubInstaller')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "edit sub installer profile" })
    async editSubInstaller(
        @Body() editSubInstallerDto:EditSubInstallerDto
    ){
        return this.profileService.editSubInstaller(editSubInstallerDto)
    }

    @Post('saveprofileimage/:id')
    @UseInterceptors(
        FilesInterceptor('files[]', 20, {
        fileFilter: imageFileFilter,
        }),
    )
    async saveProfileImage(
        @UploadedFiles() files,
        @Param('id', ParseUUIDPipe) id: string
    ) {
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
            };

            const bucketS3 = process.env.S3BUCKET;
            this.uploadS3(file.buffer, bucketS3, file.filename);
            response.push(fileReponse);
        });
        
        return this.profileService.saveProfileImage(id, response);
    }

    @Delete('removeprofileimage/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "remove profile image" })
    async removeProfileImage(
        @Param('id', ParseUUIDPipe) id: string
    ){
        return this.profileService.removeProfileImage(id)
    }

    @Get('/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get profile Details" })
    async getProfileDetails(
        @Param('id', ParseUUIDPipe) id: string
    ){
        return this.profileService.getProfileDetails(id);
    }   

    @Get('settings/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get profile settings" })
    async getProfileSettings(
        @Param('id', ParseUUIDPipe) id: string
    ){
        return this.profileService.getProfileSettings(id);
    }    

    @Get('subInstallerProfile/:id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Get profile settings" })
    async getSubInstallerProfile(
        @Param('id', ParseUUIDPipe) id: string
    ){
        return this.profileService.getSubInstallerProfile(id);
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

    @Get('/profileimage/:name')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "get profile picture" })
    async getProfileImage(
        @Param('name') name: string,
        // @Res() res: Response
    ){
        const s3 = this.getS3();
        const bucketS3 = process.env.S3BUCKET;

        const url = s3.getSignedUrl('getObject', {
            Bucket: bucketS3,
            Key: process.env.awsS3ChildFolderPath+String(name)
        })

        return {"statusCode": 200, url:url };   
        
    }
}
