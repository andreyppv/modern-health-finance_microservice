import { Test, TestingModule } from '@nestjs/testing';
import { MilestoneFundController } from './milestone-fund.controller';

describe('MilestoneFundController', () => {
  let controller: MilestoneFundController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MilestoneFundController],
    }).compile();

    controller = module.get<MilestoneFundController>(MilestoneFundController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
