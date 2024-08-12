import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Body,
} from '@nestjs/common';
import { CreditpullService } from './creditpull.service';
import { CreateCreditpullDto } from './dto/create-creditpull.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('creditpull')
@Controller('creditpull')
export class CreditpullController {
  constructor(private readonly creditpullService: CreditpullService) {}

  @Get('/creditpull/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Credit Pull Data' })
  async getCreditPullData(@Param('id', ParseUUIDPipe) id: string) {
    return this.creditpullService.getCreditPullData(id);
  }

  @Get('/creditpull/getFiles/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get files' })
  async getFiles(@Param('id', ParseUUIDPipe) id: string) {
    return this.creditpullService.getFiles(id);
  }
}
