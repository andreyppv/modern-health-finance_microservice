import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserBankAccountRepository } from 'src/repository/userBankAccounts.repository';
import { UserDebitCardRepository } from 'src/repository/userDebitCard.repository';
import { InstallerRepository } from 'src/repository/installer.repository';
import { PaymentMethodController } from './payment-method.controller';
import { PaymentMethodService } from './payment-method.service';
import {HttpModule} from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserBankAccountRepository,UserDebitCardRepository,InstallerRepository]),
    HttpModule
  ],
  controllers: [PaymentMethodController],
  providers: [PaymentMethodService]
})
export class PaymentMethodModule {}
