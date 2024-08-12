import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PromissoryNoteService } from './promissory-note.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePromissoryNoteDto } from '../promissory-note/dto/promissory-note.dto';

@ApiTags('promissory-note')
@Controller('promissory-note')
export class PromissoryNoteController {
  constructor(private readonly promissoryNoteService: PromissoryNoteService) {}
  @Get('GeneratePromissoryNote/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Promissory Note' })
  async getPromissoryNote(@Param('loan_id', ParseUUIDPipe) loan_id: string) {
    return this.promissoryNoteService.getPromissoryNote(loan_id);
  }

  @Post('/PromissoryNote/:loan_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save Promissory Note' })
  async savePromissoryNote(
    @Body() createPromissoryNoteDto: CreatePromissoryNoteDto,
    @Param('loan_id', ParseUUIDPipe) loan_id: string,
  ) {
    console.log(createPromissoryNoteDto);
    const html = await this.promissoryNoteService.savePromissoryNote(
      loan_id,
      createPromissoryNoteDto,
    );
    return html;
    //return await this.PromissoryNoteGenerate(loan_id, html.data);
  }
}
