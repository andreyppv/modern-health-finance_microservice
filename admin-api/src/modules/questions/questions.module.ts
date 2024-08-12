import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { QuestionsRepository } from '../../repository/questions.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import {UsersModule} from '../users/users.module'

@Module({
  imports: [TypeOrmModule.forFeature([QuestionsRepository]),UsersModule],
  controllers: [QuestionsController],
  exports: [QuestionsService],
  providers: [QuestionsService]
})
export class QuestionsModule {}
