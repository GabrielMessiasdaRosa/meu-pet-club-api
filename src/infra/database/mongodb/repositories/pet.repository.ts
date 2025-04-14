import { Pet } from '@/domain/entities/pet.entity';
import { IPetRepository } from '@/domain/repositories/pet.repository.interface';
import { PetMapper } from '@/infra/mappers/pet/pet.mapper';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PetSchemaDocument } from '../schemas/pet.schema';

@Injectable()
export class MongoosePetRepository implements IPetRepository {
  constructor(
    @InjectModel('Pet')
    private readonly petModel: Model<PetSchemaDocument>,
  ) {}

  async findAll(): Promise<Pet[]> {
    const pets = await this.petModel.find().exec();
    const petsDomain = pets.map((pet) => PetMapper.toDomain(pet));
    return petsDomain;
  }

  async findById(id: string): Promise<Pet | null> {
    const pet = await this.petModel.findById(id).exec();
    if (!pet) {
      return null;
    }
    const petDomain = PetMapper.toDomain(pet);
    return petDomain;
  }

  async findByUserId(userId: string): Promise<Pet[]> {
    const pets = await this.petModel.find({ userId }).exec();
    const petsDomain = pets.map((pet) => PetMapper.toDomain(pet));
    return petsDomain;
  }

  async create(petData: Pet): Promise<Pet> {
    const pet = new this.petModel(PetMapper.toPersistence(petData));
    const createdPet = await pet.save();
    const petDomain = PetMapper.toDomain(createdPet);
    return petDomain;
  }

  async update(id: string, petData: Partial<Pet>): Promise<Pet> {
    const pet = await this.petModel.findById(id).exec();

    if (!pet) {
      throw new Error('Pet not found');
    }

    const existingPet = PetMapper.toDomain(pet);

    // Criar um novo objeto Pet com os dados atualizados
    const updatedPetEntity = new Pet({
      id: existingPet.Id,
      name: petData.Name ?? existingPet.Name,
      type: petData.Type ?? existingPet.Type,
      breed: petData.Breed ?? existingPet.Breed,
      age: petData.Age ?? existingPet.Age,
      userId: existingPet.UserId, // O userId não deve ser alterado durante uma atualização
    });

    const updatedPet = await this.petModel.findByIdAndUpdate(
      id,
      PetMapper.toPersistence(updatedPetEntity),
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedPet) {
      throw new Error('Pet not found');
    }

    const petDomain = PetMapper.toDomain(updatedPet);
    return petDomain;
  }

  async delete(id: string): Promise<void> {
    const result = await this.petModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new Error('Pet not found');
    }
  }
}
