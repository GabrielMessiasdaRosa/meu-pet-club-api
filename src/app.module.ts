import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './interface/modules/user.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://root:example@localhost:27017/nestjs?authSource=admin',
    ),
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
