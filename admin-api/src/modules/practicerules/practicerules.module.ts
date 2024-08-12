import { HttpModule, HttpService, Module } from '@nestjs/common';
import { PracticerulesService } from './practicerules.service';
import { PracticerulesController } from './practicerules.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticeRulesRepository } from 'src/repository/practiceRules.respository';

@Module({
  imports: [TypeOrmModule.forFeature([PracticeRulesRepository]), HttpModule],
  controllers: [PracticerulesController],
  providers: [PracticerulesService],
})
export class PracticerulesModule {}
