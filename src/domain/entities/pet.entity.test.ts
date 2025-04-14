import { Pet } from './pet.entity';

describe('Pet Entity', () => {
  it('deve criar uma instância de Pet com todos os dados obrigatórios', () => {
    // Arrange & Act
    const pet = new Pet({
      name: 'Rex',
      type: 'Cachorro',
      userId: '123456',
    });

    // Assert
    expect(pet).toBeDefined();
    expect(pet.Id).toBeDefined(); // UUID gerado automaticamente
    expect(pet.Name).toBe('Rex');
    expect(pet.Type).toBe('Cachorro');
    expect(pet.UserId).toBe('123456');
    expect(pet.Breed).toBeUndefined();
    expect(pet.Age).toBeUndefined();
  });

  it('deve criar uma instância de Pet com todos os dados incluindo opcionais', () => {
    // Arrange
    const petData = {
      id: 'pet-123',
      name: 'Luna',
      type: 'Gato',
      breed: 'Siamês',
      age: 3,
      userId: '123456',
    };

    // Act
    const pet = new Pet(petData);

    // Assert
    expect(pet).toBeDefined();
    expect(pet.Id).toBe('pet-123');
    expect(pet.Name).toBe('Luna');
    expect(pet.Type).toBe('Gato');
    expect(pet.Breed).toBe('Siamês');
    expect(pet.Age).toBe(3);
    expect(pet.UserId).toBe('123456');
  });

  it('deve lançar erro quando nome não for fornecido', () => {
    // Arrange, Act, Assert
    expect(() => {
      new Pet({
        name: '',
        type: 'Cachorro',
        userId: '123456',
      });
    }).toThrow('Nome do pet é obrigatório');
  });

  it('deve lançar erro quando tipo não for fornecido', () => {
    // Arrange, Act, Assert
    expect(() => {
      new Pet({
        name: 'Rex',
        type: '',
        userId: '123456',
      });
    }).toThrow('Tipo do pet é obrigatório');
  });

  it('deve lançar erro quando userId não for fornecido', () => {
    // Arrange, Act, Assert
    expect(() => {
      new Pet({
        name: 'Rex',
        type: 'Cachorro',
        userId: '',
      });
    }).toThrow('ID do usuário é obrigatório');
  });

  it('deve permitir alterar o nome do pet', () => {
    // Arrange
    const pet = new Pet({
      name: 'Rex',
      type: 'Cachorro',
      userId: '123456',
    });

    // Act
    pet.setName('Max');

    // Assert
    expect(pet.Name).toBe('Max');
  });

  it('deve lançar erro ao tentar alterar o nome para vazio', () => {
    // Arrange
    const pet = new Pet({
      name: 'Rex',
      type: 'Cachorro',
      userId: '123456',
    });

    // Act & Assert
    expect(() => {
      pet.setName('');
    }).toThrow('Nome do pet é obrigatório');
  });

  it('deve permitir alterar o tipo do pet', () => {
    // Arrange
    const pet = new Pet({
      name: 'Rex',
      type: 'Cachorro',
      userId: '123456',
    });

    // Act
    pet.setType('Mamífero');

    // Assert
    expect(pet.Type).toBe('Mamífero');
  });

  it('deve lançar erro ao tentar alterar o tipo para vazio', () => {
    // Arrange
    const pet = new Pet({
      name: 'Rex',
      type: 'Cachorro',
      userId: '123456',
    });

    // Act & Assert
    expect(() => {
      pet.setType('');
    }).toThrow('Tipo do pet é obrigatório');
  });

  it('deve permitir alterar a raça do pet', () => {
    // Arrange
    const pet = new Pet({
      name: 'Rex',
      type: 'Cachorro',
      userId: '123456',
    });

    // Act
    pet.setBreed('Labrador');

    // Assert
    expect(pet.Breed).toBe('Labrador');
  });

  it('deve permitir limpar a raça do pet (definir como undefined)', () => {
    // Arrange
    const pet = new Pet({
      name: 'Rex',
      type: 'Cachorro',
      breed: 'Labrador',
      userId: '123456',
    });

    // Act
    pet.setBreed(undefined);

    // Assert
    expect(pet.Breed).toBeUndefined();
  });

  it('deve permitir alterar a idade do pet', () => {
    // Arrange
    const pet = new Pet({
      name: 'Rex',
      type: 'Cachorro',
      userId: '123456',
    });

    // Act
    pet.setAge(5);

    // Assert
    expect(pet.Age).toBe(5);
  });

  it('deve permitir limpar a idade do pet (definir como undefined)', () => {
    // Arrange
    const pet = new Pet({
      name: 'Rex',
      type: 'Cachorro',
      age: 3,
      userId: '123456',
    });

    // Act
    pet.setAge(undefined);

    // Assert
    expect(pet.Age).toBeUndefined();
  });
});
