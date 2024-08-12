import { Module } from '@nestjs/common';
import { ApprovedService } from './approved.service';
import { ApprovedController } from './approved.controller';

@Module({
  controllers: [ApprovedController],
  providers: [ApprovedService]
})
export class ApprovedModule {}
