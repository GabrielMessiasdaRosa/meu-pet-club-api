import { PetService } from '@/application/services/pet.service';
import { MongoosePetRepository } from '@/infra/database/mongodb/repositories/pet.repository';
import { PetSchemaDocument } from '@/infra/database/mongodb/schemas/pet.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PetsController } from '../server/controllers/pets.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Pet', schema: PetSchemaDocument }]),
  ],
  controllers: [PetsController],
  providers: [
    PetService,
    {
      provide: 'PetRepository',
      useClass: MongoosePetRepository,
    },
  ],
  exports: [PetService],
})
export class PetsModule {}
