import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsRepository } from 'src/repository/settings.repository';
import { MilestoneFundController } from './milestone-fund.controller';
import { MilestoneFundService } from './milestone-fund.service';

@Module({
  imports: [TypeOrmModule.forFeature([SettingsRepository])],
  controllers: [MilestoneFundController],
  providers: [MilestoneFundService]
})
export class MilestoneFundModule {}
