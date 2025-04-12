import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe(' AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should signUp', async () => {
    const signUpDto = {
      email: 'gabriel@email.com',
      password: '12345678',
      username: 'gabriel',
    };
    await service.signUp(signUpDto);
  });
});
