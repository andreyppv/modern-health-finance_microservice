import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogRepository } from 'src/repository/log.repository';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([LogRepository])],
  controllers: [LogsController],
  providers: [LogsService]
})
export class LogsModule {}
