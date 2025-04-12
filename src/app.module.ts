import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import envConfig from './config/env-config';
import { UsersModule } from './interface/modules/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [envConfig],
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
