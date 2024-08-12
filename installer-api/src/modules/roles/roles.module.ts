import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

@Module({
  controllers: [RolesController],
  exports:[
    RolesService
  ],
  providers: [RolesService]
})
export class RolesModule {}
