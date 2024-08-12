
import { Controller, Get, HttpStatus, HttpCode,UseGuards,ParseUUIDPipe,Param,Post,Body } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../guards/roles.guard';
import { SetMetadata } from '@nestjs/common';
import {CreateQuestionsDto} from './dto/create-questions.dto';
import {UpdateQuestionsDto} from './dto/update-questions.dto';

export const Roles = (...roles: string[]) => SetMetadata('role', roles);


@ApiTags('Questions')
@ApiBearerAuth()
@Roles('admin')
@UseGuards(AuthGuard('jwt'),RolesGuard)


@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  

  @Get('')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "GET_ALL" })
  async findAll() {
    return this.questionsService.findAll();
  }

  @Get('delete/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete Question" })
  async deleteById(
    @Param('id', ParseUUIDPipe) id: string
  ){
    return this.questionsService.deleteQuestionById(id);
  }

  @Post('update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update Questions" })
  async update(
    @Body() updateQuestionsDto: UpdateQuestionsDto
  ){
    return this.questionsService.update(updateQuestionsDto);
  }

  @Post('add')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Add Questions" })
  async save(
    @Body() createQuestionsDto: CreateQuestionsDto
  ){
    return this.questionsService.save(createQuestionsDto);
  }

}
