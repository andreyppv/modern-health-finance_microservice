import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FilesRepository } from '../../repository/files.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import {LoanRepository} from '../../repository/loan.repository';

@Module({
  controllers: [FilesController],
  imports: [TypeOrmModule.forFeature([FilesRepository,LoanRepository])],
  exports: [FilesService],
  providers: [FilesService]
})
export class FilesModule {}
