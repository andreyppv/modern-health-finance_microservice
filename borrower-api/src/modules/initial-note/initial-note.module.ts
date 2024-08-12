import { Module } from '@nestjs/common';
import { InitialNoteService } from './initial-note.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InitialNoteController } from './initial-note.controller';
import { userConsentRepository } from '../../repository/userConsent.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([userConsentRepository]),
  ],
  controllers: [InitialNoteController],
  providers: [InitialNoteService]
})
export class InitialNoteModule {}
