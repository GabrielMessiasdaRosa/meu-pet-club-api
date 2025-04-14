import { UserService } from '@/application/services/user.service';
import { BcryptService } from '@/iam/hashing/bcrypt.service';
import { HashingService } from '@/iam/hashing/hashing.service';
import { MongooseUserRepository } from '@/infra/database/mongodb/repositories/user.repository';
import { UserSchemaDocument } from '@/infra/database/mongodb/schemas/user.schema';
import { EmailModule } from '@/infra/email/email.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from '../server/controllers/users.controller';
import { PetsModule } from './pet.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchemaDocument }]),
    PetsModule, // Importando o módulo de pets para ter acesso ao PetService
    EmailModule, // Importando o módulo de email para ter acesso ao EmailService
  ],
  controllers: [UsersController],
  providers: [
    UserService,
    {
      provide: 'UserRepository',
      useClass: MongooseUserRepository,
    },
    {
      provide: HashingService,
      useClass: BcryptService,
    },
  ],
  exports: [UserService],
})
export class UsersModule {}
