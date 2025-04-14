import { Pet } from '@/domain/entities/pet.entity';
import { IPetRepository } from '@/domain/repositories/pet.repository.interface';

export class MockPetRepository implements IPetRepository {
  private pets: Pet[] = [];

  async findAll(): Promise<Pet[]> {
    return this.pets;
  }

  async findById(id: string): Promise<Pet | null> {
    const pet = this.pets.find((pet) => pet.Id === id);
    return pet || null;
  }

  async findByUserId(userId: string): Promise<Pet[]> {
    return this.pets.filter((pet) => pet.UserId === userId);
  }

  async create(petData: Pet): Promise<Pet> {
    this.pets.push(petData);
    return petData;
  }

  async update(id: string, petData: Partial<Pet>): Promise<Pet> {
    const petIndex = this.pets.findIndex((pet) => pet.Id === id);

    if (petIndex === -1) {
      throw new Error('Pet não encontrado');
    }

    const pet = this.pets[petIndex];

    // Criando um novo objeto Pet com os dados atualizados
    const updatedPet = new Pet({
      id: pet.Id,
      name: petData.Name || pet.Name,
      type: petData.Type || pet.Type,
      breed: petData.Breed !== undefined ? petData.Breed : pet.Breed,
      age: petData.Age !== undefined ? petData.Age : pet.Age,
      userId: pet.UserId,
    });

    this.pets[petIndex] = updatedPet;

    return updatedPet;
  }

  async delete(id: string): Promise<void> {
    const petIndex = this.pets.findIndex((pet) => pet.Id === id);

    if (petIndex === -1) {
      throw new Error('Pet não encontrado');
    }

    this.pets.splice(petIndex, 1);
  }

  // Método auxiliar para limpar todos os pets do repositório (útil para testes)
  clearAll(): void {
    this.pets = [];
  }

  // Método auxiliar para adicionar múltiplos pets de uma vez (útil para testes)
  addMany(pets: Pet[]): void {
    this.pets.push(...pets);
  }
}

describe('MockPetRepository', () => {
  let repository: MockPetRepository;
  const testPet1 = new Pet({
    id: 'pet-1',
    name: 'Rex',
    type: 'Cachorro',
    breed: 'Labrador',
    age: 3,
    userId: 'user-1',
  });

  const testPet2 = new Pet({
    id: 'pet-2',
    name: 'Luna',
    type: 'Gato',
    breed: 'Siamês',
    age: 2,
    userId: 'user-2',
  });

  beforeEach(() => {
    repository = new MockPetRepository();
    repository.clearAll();
  });

  it('deve criar um pet corretamente', async () => {
    await repository.create(testPet1);
    const result = await repository.findById(testPet1.Id);
    expect(result).toEqual(testPet1);
  });

  it('deve encontrar todos os pets', async () => {
    await repository.create(testPet1);
    await repository.create(testPet2);

    const result = await repository.findAll();

    expect(result).toHaveLength(2);
    expect(result).toEqual(expect.arrayContaining([testPet1, testPet2]));
  });

  it('deve encontrar pet por ID', async () => {
    await repository.create(testPet1);
    await repository.create(testPet2);

    const result = await repository.findById(testPet2.Id);

    expect(result).toEqual(testPet2);
  });

  it('deve retornar null quando pet não for encontrado por ID', async () => {
    const result = await repository.findById('id-inexistente');
    expect(result).toBeNull();
  });

  it('deve encontrar pets por ID do usuário', async () => {
    await repository.create(testPet1);
    await repository.create(testPet2);

    const result = await repository.findByUserId(testPet1.UserId);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(testPet1);
  });

  it('deve atualizar um pet corretamente', async () => {
    await repository.create(testPet1);

    await repository.update(testPet1.Id, {
      Name: 'Rex Atualizado',
      Age: 4,
    });

    const updatedPet = await repository.findById(testPet1.Id);

    expect(updatedPet?.Name).toBe('Rex Atualizado');
    expect(updatedPet?.Type).toBe(testPet1.Type); // Não deve mudar
    expect(updatedPet?.Age).toBe(4);
  });

  it('deve lançar erro ao atualizar pet inexistente', async () => {
    await expect(
      repository.update('id-inexistente', { Name: 'Nome' }),
    ).rejects.toThrow('Pet não encontrado');
  });

  it('deve excluir um pet corretamente', async () => {
    await repository.create(testPet1);
    await repository.create(testPet2);

    await repository.delete(testPet1.Id);

    const allPets = await repository.findAll();
    const deletedPet = await repository.findById(testPet1.Id);

    expect(allPets).toHaveLength(1);
    expect(deletedPet).toBeNull();
  });

  it('deve lançar erro ao excluir pet inexistente', async () => {
    await expect(repository.delete('id-inexistente')).rejects.toThrow(
      'Pet não encontrado',
    );
  });

  it('deve limpar todos os pets com clearAll', async () => {
    await repository.create(testPet1);
    await repository.create(testPet2);

    repository.clearAll();
    const result = await repository.findAll();

    expect(result).toHaveLength(0);
  });

  it('deve adicionar múltiplos pets com addMany', async () => {
    repository.addMany([testPet1, testPet2]);

    const result = await repository.findAll();

    expect(result).toHaveLength(2);
    expect(result).toEqual(expect.arrayContaining([testPet1, testPet2]));
  });
});
