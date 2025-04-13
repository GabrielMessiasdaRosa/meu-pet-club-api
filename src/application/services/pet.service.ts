import { RoleEnum } from '@/common/enums/role.enum';
import { Pet } from '@/domain/entities/pet.entity';
import { IPetRepository } from '@/domain/repositories/pet.repository.interface';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { v4 as uuid } from 'uuid';
import { CreatePetDto } from '../dtos/pet/create-pet.dto';
import { UpdatePetDto } from '../dtos/pet/update-pet.dto';

@Injectable()
export class PetService {
  constructor(
    @Inject('PetRepository')
    private readonly petRepository: IPetRepository,
  ) {}

  async findAll() {
    return await this.petRepository.findAll();
  }

  async findById(id: string) {
    return await this.petRepository.findById(id);
  }

  async findByUserId(userId: string) {
    return await this.petRepository.findByUserId(userId);
  }

  async create(petData: CreatePetDto, currentUser: ActiveUserData) {
    // Verificando se o usuário é do tipo CLIENT
    if (currentUser.role !== RoleEnum.USER) {
      throw new ForbiddenException(
        'Apenas usuários do tipo CLIENTE podem criar pets',
      );
    }

    // Criando o Pet associado ao usuário atual
    const newPet = new Pet({
      id: uuid(),
      name: petData.name,
      type: petData.type,
      breed: petData.breed,
      age: petData.age,
      userId: currentUser.sub,
    });

    return await this.petRepository.create(newPet);
  }

  async update(id: string, petData: UpdatePetDto, currentUser: ActiveUserData) {
    // Verificando se o pet existe
    const pet = await this.petRepository.findById(id);
    if (!pet) {
      throw new NotFoundException('Pet não encontrado');
    }

    // Verificando se o usuário é ROOT (não pode atualizar pets)
    if (currentUser.role === RoleEnum.ROOT) {
      throw new ForbiddenException('Usuários ROOT não podem atualizar pets');
    }

    // Verificando se o pet pertence ao usuário atual
    if (pet.UserId !== currentUser.sub) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar este pet',
      );
    }

    // Atualizando o pet
    return await this.petRepository.update(id, {
      Name: petData.name,
      Type: petData.type,
      Breed: petData.breed,
      Age: petData.age,
    });
  }

  async delete(id: string, currentUser: ActiveUserData) {
    // Verificando se o pet existe
    const pet = await this.petRepository.findById(id);
    if (!pet) {
      throw new NotFoundException('Pet não encontrado');
    }

    // Verificando se o pet pertence ao usuário atual ou se é um administrador
    if (pet.UserId !== currentUser.sub && currentUser.role !== RoleEnum.ROOT) {
      throw new ForbiddenException(
        'Você não tem permissão para deletar este pet',
      );
    }

    // Deletando o pet
    await this.petRepository.delete(id);
  }
}
