import { MongooseUserRepository } from '@/infra/database/mongodb/repositories/user.repository';
import { UserSchemaDocument } from '@/infra/database/mongodb/schemas/user.schema';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './authentication/auth.controller';
import { AuthService } from './authentication/auth.service';
import { AccessTokenGuard } from './authentication/guards/access-token/access-token.guard';
import { AuthGuard } from './authentication/guards/auth/auth.guard';
import { RolesGuard } from './authorization/guards/roles.guard';
import jwtConfig from './config/jwt.config';
import { BcryptService } from './hashing/bcrypt.service';
import { HashingService } from './hashing/hashing.service';
import { RedisModule } from './redis/redis.module';
import { TokenIdsStorage } from './redis/storage/token-ids.storage';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchemaDocument }]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    RedisModule,
  ],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: 'UserRepositoryModel',
      useClass: MongooseUserRepository,
    },
    AccessTokenGuard,
    TokenIdsStorage,
    AuthService,
  ],
  controllers: [AuthController],
})
export class IamModule {}
