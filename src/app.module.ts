import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import envConfig from './config/env-config';
import { IamModule } from './iam/iam.module';
import { EmailModule } from './infra/email/email.module';
import { PetsModule } from './interface/modules/pet.module';
import { UsersModule } from './interface/modules/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [envConfig],
    }),
    MongooseModule.forRoot(process.env.MONGO_URI ?? ''),
    EmailModule,
    IamModule,
    UsersModule,
    PetsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
