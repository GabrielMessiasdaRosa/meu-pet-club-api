import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../redis.service';
import {
  InvalidatedRefreshTokenError,
  TokenIdsStorage,
} from './token-ids.storage';

describe('TokenIdsStorage', () => {
  let tokenIdsStorage: TokenIdsStorage;
  let redisService: RedisService;

  const mockRedisService = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenIdsStorage,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    tokenIdsStorage = module.get<TokenIdsStorage>(TokenIdsStorage);
    redisService = module.get<RedisService>(RedisService);
  });

  it('deve ser definido', () => {
    expect(tokenIdsStorage).toBeDefined();
  });

  describe('insert', () => {
    it('deve armazenar o ID do token no Redis com o usuário associado', async () => {
      const userId = 'user-123';
      const tokenId = 'token-456';

      await tokenIdsStorage.insert(userId, tokenId);

      expect(mockRedisService.set).toHaveBeenCalledWith(
        `user:${userId}:refreshToken`,
        tokenId,
        expect.any(Object),
      );
    });
  });

  describe('validate', () => {
    it('deve retornar true quando o token for válido para o usuário', async () => {
      const userId = 'user-123';
      const tokenId = 'token-456';

      mockRedisService.get.mockResolvedValueOnce(tokenId);

      const result = await tokenIdsStorage.validate(userId, tokenId);

      expect(mockRedisService.get).toHaveBeenCalledWith(
        `user:${userId}:refreshToken`,
      );
      expect(result).toBe(true);
    });

    it('deve lançar InvalidatedRefreshTokenError quando o token não for válido para o usuário', async () => {
      const userId = 'user-123';
      const tokenId = 'token-456';
      const wrongTokenId = 'token-789';

      mockRedisService.get.mockResolvedValueOnce(wrongTokenId);

      await expect(tokenIdsStorage.validate(userId, tokenId)).rejects.toThrow(
        InvalidatedRefreshTokenError,
      );

      expect(mockRedisService.get).toHaveBeenCalledWith(
        `user:${userId}:refreshToken`,
      );
    });

    it('deve lançar InvalidatedRefreshTokenError quando não houver token associado ao usuário', async () => {
      const userId = 'user-123';
      const tokenId = 'token-456';

      mockRedisService.get.mockResolvedValueOnce(null);

      await expect(tokenIdsStorage.validate(userId, tokenId)).rejects.toThrow(
        InvalidatedRefreshTokenError,
      );

      expect(mockRedisService.get).toHaveBeenCalledWith(
        `user:${userId}:refreshToken`,
      );
    });
  });

  describe('invalidate', () => {
    it('deve remover o token associado ao usuário', async () => {
      const userId = 'user-123';

      await tokenIdsStorage.invalidate(userId);

      expect(mockRedisService.del).toHaveBeenCalledWith(
        `user:${userId}:refreshToken`,
      );
    });
  });

  describe('addToBlacklist', () => {
    it('deve adicionar o token à blacklist', async () => {
      const token = 'expired-token';

      await tokenIdsStorage.addToBlacklist(token);

      expect(mockRedisService.set).toHaveBeenCalledWith(
        `bl:${token}`,
        '1',
        expect.any(Object),
      );
    });
  });

  describe('isBlacklisted', () => {
    it('deve retornar true se o token estiver na blacklist', async () => {
      const token = 'blacklisted-token';

      mockRedisService.exists.mockResolvedValueOnce(1);

      const result = await tokenIdsStorage.isBlacklisted(token);

      expect(mockRedisService.exists).toHaveBeenCalledWith(`bl:${token}`);
      expect(result).toBe(true);
    });

    it('deve retornar false se o token não estiver na blacklist', async () => {
      const token = 'valid-token';

      mockRedisService.exists.mockResolvedValueOnce(0);

      const result = await tokenIdsStorage.isBlacklisted(token);

      expect(mockRedisService.exists).toHaveBeenCalledWith(`bl:${token}`);
      expect(result).toBe(false);
    });
  });
});
