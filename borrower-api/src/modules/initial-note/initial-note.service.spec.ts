import { Test, TestingModule } from '@nestjs/testing';
import { InitialNoteService } from './initial-note.service';

describe('InitialNoteService', () => {
  let service: InitialNoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InitialNoteService],
    }).compile();

    service = module.get<InitialNoteService>(InitialNoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
