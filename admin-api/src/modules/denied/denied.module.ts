import { Module } from '@nestjs/common';
import { DeniedService } from './denied.service';
import { DeniedController } from './denied.controller';

@Module({
  controllers: [DeniedController],
  providers: [DeniedService]
})
export class DeniedModule {}
