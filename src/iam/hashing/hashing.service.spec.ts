import { Test, TestingModule } from '@nestjs/testing';
import { HashingService } from './hashing.service';
import { BcryptService } from './bcrypt.service';

describe('HashingService', () => {
  let service: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: HashingService,
          useClass: BcryptService,
        },
      ],
    }).compile();

    service = module.get<HashingService>(HashingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash data', async () => {
    const data = 'password';
    const hashedData = await service.hash(data);
    expect(hashedData).toBeDefined();
    expect(hashedData).not.toEqual(data);
  });

  it('should compare data and encrypted value', async () => {
    const data = 'password';
    const encryptedData = await service.hash(data);
    const result = await service.compare(data, encryptedData);
    expect(result).toBe(true);
  });
});
