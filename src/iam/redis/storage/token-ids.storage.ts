import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/iam/redis/redis.service';
export class InvalidatedRefreshTokenError extends Error {}
@Injectable()
export class TokenIdsStorage {
  constructor(private readonly redisService: RedisService) {}

  async insert(userId: string, tokenId: string): Promise<void> {
    await this.redisService.set(this.getKey(userId), tokenId);
  }

  async validate(userId: string, tokenId: string): Promise<boolean> {
    const storedId = await this.redisService.get(this.getKey(userId));
    if (storedId !== tokenId) {
      throw new InvalidatedRefreshTokenError();
    }
    return storedId === tokenId;
  }

  async invalidate(userId: string): Promise<void> {
    await this.redisService.del(this.getKey(userId));
  }

  async exists(userId: string): Promise<boolean> {
    const storedId = await this.redisService.get(this.getKey(userId));
    return !!storedId;
  }

  async addToBlacklist(accessToken: string): Promise<void> {
    const key = `blacklist-${accessToken}`;
    const expirationTime = 24 * 60 * 60; // 24 horas em segundos
    await this.redisService.set(key, 'blacklisted', expirationTime); // Define TTL para 24 horas
  }

  async isBlacklisted(accessToken: string): Promise<boolean> {
    const key = `blacklist-${accessToken}`;
    const result = await this.redisService.get(key);
    console.log('&&&&&&&&&&&&&&', result);
    console.log('&&&&&&&&&&&&&&', key);
    return result === 'blacklisted';
  }

  private getKey(userId: string): string {
    return `user-${userId}`;
  }
}
