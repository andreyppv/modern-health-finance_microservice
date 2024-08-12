import { Module } from '@nestjs/common';
import { StateserviceService } from './stateservice.service';
import { StateserviceController } from './stateservice.controller';
import { StateserviceRepository } from '../../repository/stateservice.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([StateserviceRepository])],
  exports: [StateserviceService],
  controllers: [StateserviceController],
  providers: [StateserviceService],
})
export class StateserviceModule {}
