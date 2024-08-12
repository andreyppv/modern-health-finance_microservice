import { Module } from '@nestjs/common';
import { MailcontrollersService } from './mailcontrollers.service';
import { MailcontrollersController } from './mailcontrollers.controller';
import { SendGridModule } from '@ntegral/nestjs-sendgrid';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerRepository } from '../../repository/customer.repository';
import { LogRepository } from '../../repository/log.repository';

@Module({
  imports: [
    SendGridModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (cfg: ConfigService) => ({
        apiKey: cfg.get('SENDGRID_API_KEY'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([CustomerRepository, LogRepository]),
  ],
  controllers: [MailcontrollersController],
  providers: [MailcontrollersService],
})
export class MailcontrollersModule {}
