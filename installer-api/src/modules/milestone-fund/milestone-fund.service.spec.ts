import { Test, TestingModule } from '@nestjs/testing';
import { MilestoneFundService } from './milestone-fund.service';

describe('MilestoneFundService', () => {
  let service: MilestoneFundService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MilestoneFundService],
    }).compile();

    service = module.get<MilestoneFundService>(MilestoneFundService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
