import { UserService } from '@/application/services/user.service';
import { MongooseUserRepository } from '@/infra/database/mongodb/repositories/user.repository';
import { UserSchemaDocument } from '@/infra/database/mongodb/schemas/user.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from '../server/controllers/users.controller';
import { PetsModule } from './pet.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchemaDocument }]),
    PetsModule, // Importando o módulo de pets para ter acesso ao PetService
  ],
  controllers: [UsersController],
  providers: [
    UserService,
    {
      provide: 'UserRepository',
      useClass: MongooseUserRepository,
    },
  ],
  exports: [UserService],
})
export class UsersModule {}
