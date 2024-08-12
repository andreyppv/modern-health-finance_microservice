import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './configs/database/typeorm.config';

import { APP_GUARD } from '@nestjs/core';
import {RolesGuard} from './guards/roles.guard';
import { UsersModule } from './modules/users/users.module';
import { MainModule } from './modules/main/main.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ProfileModule } from './modules/profile/profile.module';
import { MailModule } from './mail/mail.module';
import { FilesModule } from './modules/files/files.module';
import { UserManagementModule } from './modules/user-management/user-management.module';
import { RolesModule } from './modules/roles/roles.module';
import { LogsModule } from './modules/logs/logs.module';
import { MilestoneFundModule } from './modules/milestone-fund/milestone-fund.module';
import { PaymentMethodModule } from './modules/payment-method/payment-method.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    MainModule,
    CustomersModule,
    ProfileModule,
    MailModule,
    FilesModule,
    UserManagementModule,
    RolesModule,
    LogsModule,
    MilestoneFundModule,
    PaymentMethodModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
