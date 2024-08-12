import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesRepository } from 'src/repository/files.repository';
import { InstallerRepository } from 'src/repository/installer.repository';
import { UserBankAccountRepository } from 'src/repository/userBankAccounts.repository';
import { UserDebitCardRepository } from 'src/repository/userDebitCard.repository';
import { UserRepository } from 'src/repository/users.repository';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([FilesRepository, InstallerRepository, UserRepository, UserBankAccountRepository,UserDebitCardRepository])],
  controllers: [ProfileController],
  providers: [ProfileService]
})
export class ProfileModule {}
