import { RoleEnum } from '@/common/enums/role.enum';
import { Pet } from '@/domain/entities/pet.entity';
import { MockPetRepository } from '@/infra/database/mock-repositories/mock-pet.repository.test';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { PetService } from './pet.service';

describe('PetService', () => {
  let petService: PetService;
  let petRepository: MockPetRepository;

  // Usuários para teste
  const userClient: ActiveUserData = {
    sub: 'user-123',
    email: 'user@example.com',
    name: 'User Test',
    role: RoleEnum.USER,
  };

  const userAdmin: ActiveUserData = {
    sub: 'admin-123',
    email: 'admin@example.com',
    name: 'Admin Test',
    role: RoleEnum.ADMIN,
  };

  const userRoot: ActiveUserData = {
    sub: 'root-123',
    email: 'root@example.com',
    name: 'Root Test',
    role: RoleEnum.ROOT,
  };

  // Pets para teste
  const pet1 = new Pet({
    id: 'pet-1',
    name: 'Rex',
    type: 'Cachorro',
    breed: 'Labrador',
    age: 3,
    userId: userClient.sub,
  });

  const pet2 = new Pet({
    id: 'pet-2',
    name: 'Luna',
    type: 'Gato',
    breed: 'Siamês',
    age: 2,
    userId: 'user-456',
  });

  beforeEach(async () => {
    petRepository = new MockPetRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetService,
        {
          provide: 'PetRepository',
          useValue: petRepository,
        },
      ],
    }).compile();

    petService = module.get<PetService>(PetService);

    // Reset e adiciona pets para os testes
    petRepository.clearAll();
    petRepository.addMany([pet1, pet2]);
  });

  describe('findAll', () => {
    it('deve retornar todos os pets para usuário admin', async () => {
      const result = await petService.findAll(userAdmin);
      expect(result).toHaveLength(2);
      expect(result).toEqual(expect.arrayContaining([pet1, pet2]));
    });

    it('deve retornar todos os pets para usuário root', async () => {
      const result = await petService.findAll(userRoot);
      expect(result).toHaveLength(2);
      expect(result).toEqual(expect.arrayContaining([pet1, pet2]));
    });

    it('deve retornar apenas os pets do usuário logado para usuário comum', async () => {
      const result = await petService.findAll(userClient);
      expect(result).toHaveLength(1);
      expect(result[0].Id).toBe(pet1.Id);
    });
  });

  describe('findById', () => {
    it('deve retornar um pet pelo ID para o dono do pet', async () => {
      const result = await petService.findById(pet1.Id, userClient);
      expect(result).toEqual(pet1);
    });

    it('deve retornar um pet pelo ID para um admin', async () => {
      const result = await petService.findById(pet1.Id, userAdmin);
      expect(result).toEqual(pet1);
    });

    it('deve retornar um pet pelo ID para um root', async () => {
      const result = await petService.findById(pet1.Id, userRoot);
      expect(result).toEqual(pet1);
    });

    it('deve lançar NotFoundException quando pet não existe', async () => {
      await expect(
        petService.findById('pet-inexistente', userClient),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException quando usuário comum tenta acessar pet de outro usuário', async () => {
      await expect(petService.findById(pet2.Id, userClient)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findByUserId', () => {
    it('deve retornar os pets de um usuário específico', async () => {
      const result = await petService.findByUserId(userClient.sub);
      expect(result).toHaveLength(1);
      expect(result[0].Id).toBe(pet1.Id);
    });

    it('deve retornar array vazio se o usuário não tem pets', async () => {
      const result = await petService.findByUserId('usuario-sem-pets');
      expect(result).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('deve criar um novo pet para um usuário comum', async () => {
      const createPetDto = {
        name: 'Thor',
        type: 'Cachorro',
        breed: 'Husky',
        age: 2,
      };

      const result = await petService.create(createPetDto, userClient);

      expect(result).toBeDefined();
      expect(result.Name).toBe(createPetDto.name);
      expect(result.Type).toBe(createPetDto.type);
      expect(result.Breed).toBe(createPetDto.breed);
      expect(result.Age).toBe(createPetDto.age);
      expect(result.UserId).toBe(userClient.sub);
    });

    it('deve lançar ForbiddenException quando admin tenta criar um pet', async () => {
      const createPetDto = {
        name: 'Thor',
        type: 'Cachorro',
        breed: 'Husky',
        age: 2,
      };

      await expect(petService.create(createPetDto, userAdmin)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('deve lançar ForbiddenException quando root tenta criar um pet', async () => {
      const createPetDto = {
        name: 'Thor',
        type: 'Cachorro',
        breed: 'Husky',
        age: 2,
      };

      await expect(petService.create(createPetDto, userRoot)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar um pet que pertence ao próprio usuário', async () => {
      const updatePetDto = {
        id: pet1.Id,
        name: 'Rex Atualizado',
        breed: 'Golden Retriever',
      };

      const result = await petService.update(pet1.Id, updatePetDto, userClient);

      expect(result.Name).toBe(updatePetDto.name);
      expect(result.Breed).toBe(updatePetDto.breed);
      expect(result.Type).toBe(pet1.Type); // Não alterado
    });

    it('deve permitir que um admin atualize qualquer pet', async () => {
      const updatePetDto = {
        id: pet2.Id,
        name: 'Luna Atualizada',
      };

      const result = await petService.update(pet2.Id, updatePetDto, userAdmin);

      expect(result.Name).toBe(updatePetDto.name);
    });

    it('deve permitir que um root atualize qualquer pet', async () => {
      const updatePetDto = {
        id: pet2.Id,
        name: 'Luna Atualizada por ROOT',
      };

      const result = await petService.update(pet2.Id, updatePetDto, userRoot);

      expect(result.Name).toBe(updatePetDto.name);
    });

    it('deve lançar NotFoundException quando pet não existe', async () => {
      await expect(
        petService.update(
          'pet-inexistente',
          { id: 'pet-inexistente', name: 'Novo Nome' },
          userClient,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException quando usuário comum tenta atualizar pet de outro usuário', async () => {
      await expect(
        petService.update(
          pet2.Id,
          { id: pet2.Id, name: 'Novo Nome' },
          userClient,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('deve excluir um pet que pertence ao próprio usuário', async () => {
      await petService.delete(pet1.Id, userClient);

      // Verifica se o pet foi excluído do repositório
      const pets = await petRepository.findAll();
      expect(pets).toHaveLength(1);
      expect(pets[0].Id).not.toBe(pet1.Id);
    });

    it('deve permitir que um admin exclua qualquer pet', async () => {
      await petService.delete(pet2.Id, userAdmin);

      // Verifica se o pet foi excluído do repositório
      const pets = await petRepository.findAll();
      expect(pets).toHaveLength(1);
      expect(pets[0].Id).not.toBe(pet2.Id);
    });

    it('deve permitir que um root exclua qualquer pet', async () => {
      await petService.delete(pet2.Id, userRoot);

      // Verifica se o pet foi excluído do repositório
      const pets = await petRepository.findAll();
      expect(pets).toHaveLength(1);
      expect(pets[0].Id).not.toBe(pet2.Id);
    });

    it('deve lançar NotFoundException quando pet não existe', async () => {
      await expect(
        petService.delete('pet-inexistente', userClient),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException quando usuário comum tenta excluir pet de outro usuário', async () => {
      await expect(petService.delete(pet2.Id, userClient)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
