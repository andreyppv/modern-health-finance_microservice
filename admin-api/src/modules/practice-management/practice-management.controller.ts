import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UploadedFiles,
  UseInterceptors,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PracticeManagementService } from './practice-management.service';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreatePracticeDto } from './dto/create-practice.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { S3 } from 'aws-sdk';
import { Logger } from '@nestjs/common';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { url } from 'inspector';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);
export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|pdf|JPG|JPEG|PNG|PDF)$/)) {
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
};

@ApiTags('Practice Management')
//@ApiBearerAuth()
//@Roles('admin')
//@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('practice')
export class PracticeManagementController {
  constructor(
    private readonly practiceManagementService: PracticeManagementService,
  ) {}

  @Get('/all-admins')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get All Practice Admins' })
  async getAllAdmins() {
    return await this.practiceManagementService.getAllPracticeAdmin();
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all the Practice details' })
  async getAllPractice() {
    return await this.practiceManagementService.getallPractice();
  }

  @Get('/getPracticeName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all the Practice details' })
  async getPracticeName() {
    return await this.practiceManagementService.getPracticeName();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get the details of a particular practice' })
  async getPractice(@Param('id', ParseUUIDPipe) id: string) {
    return await this.practiceManagementService.getPractice(id);
  }

  @Get('/practice-by-url/:url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get the details of a particular practice' })
  async getPracticeByUrl(@Param('url') url: string) {
    return await this.practiceManagementService.getPracticeByUrl(url);
  }

  @Get('/practice-admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get the details of a particular practice Admin' })
  async getPracticeAdminById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.practiceManagementService.getPracticeAdminById(id);
  }

  @Post('/create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a Practice' })
  @UseInterceptors(
    FilesInterceptor('files[]', 20, {
      fileFilter: imageFileFilter,
    }),
  )
  async createPractice(
    @UploadedFiles() files,
    @Body() createPracticeDto: CreatePracticeDto,
  ) {
    return await this.practiceManagementService.create(createPracticeDto);
  }

  @Put('/edit/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Edit the details of Practice' })
  async editPractice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createPracticeDto: CreatePracticeDto,
  ) {
    return await this.practiceManagementService.edit(createPracticeDto, id);
  }

  @Put('/edit-admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Edit the details of Practice Admin' })
  async editPracticeAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    return await this.practiceManagementService.editPracticeAdmin(
      updateAdminDto,
      id,
    );
  }

  @Post('/create-admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a Practice Admin' })
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return await this.practiceManagementService.createAdmin(createAdminDto);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all the Practice details' })
  async geteditpracticeadmin(@Param('id', ParseUUIDPipe) id: string) {
    return await this.practiceManagementService.geteditpracticeadmin(id);
  }

  //Files Functions
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
