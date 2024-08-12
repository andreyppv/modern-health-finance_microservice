import { Test, TestingModule } from '@nestjs/testing';
import { InitialNoteController } from './initial-note.controller';
import { InitialNoteService } from './initial-note.service';

describe('InitialNoteController', () => {
  let controller: InitialNoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InitialNoteController],
      providers: [InitialNoteService],
    }).compile();

    controller = module.get<InitialNoteController>(InitialNoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
