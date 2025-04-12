import { User } from "@/domain/entities/user.entity";
import { InMemoryUserRepository } from "./mock-user.repository";
import { RoleEnum } from "@/common/enums/role.enum";

describe('InMemoryUserRepository - create', () => {
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
  });

  it('should create a new user successfully', async () => {
    // Arrange
    const userData = new User({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    });

    // Act
    const createdUser = await repository.create(userData);

    // Assert
    expect(createdUser).toBeDefined();
    expect(createdUser.Id).toBe('1');
    expect(createdUser.Name).toBe('John Doe');
    expect(createdUser.Email).toBe('john@example.com');
    expect(createdUser.Password).toBe('password123');
    expect(createdUser.Role).toBe(RoleEnum.USER);

    // Verify it was added to the repository
    const foundUser = await repository.findById('1');
    expect(foundUser).not.toBeNull();
    expect(foundUser?.Id).toBe('1');
  });

  it('should throw an error when creating a user with existing ID', async () => {
    // Arrange
    const existingUser = new User({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    });

    await repository.create(existingUser);

    const duplicateUser = new User({
      id: '1', // Same ID
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password456',
      role: RoleEnum.ADMIN,
    });

    // Act & Assert
    await expect(repository.create(duplicateUser)).rejects.toThrow(
      'User already exists',
    );

    // Verify the original user was not modified
    const foundUser = await repository.findById('1');
    expect(foundUser?.Name).toBe('John Doe');
    expect(foundUser?.Email).toBe('john@example.com');
  });

  it('should maintain multiple users correctly', async () => {
    // Arrange
    const user1 = new User({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    });

    const user2 = new User({
      id: '2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password456',
      role: RoleEnum.ADMIN,
    });

    // Act
    await repository.create(user1);
    await repository.create(user2);

    // Assert
    const allUsers = await repository.findAll();
    expect(allUsers.length).toBe(2);

    const foundUser1 = await repository.findById('1');
    expect(foundUser1?.Name).toBe('John Doe');

    const foundUser2 = await repository.findById('2');
    expect(foundUser2?.Name).toBe('Jane Doe');
  });
});

describe('InMemoryUserRepository - findByEmail', () => {
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
  });

  it('should find a user by email', async () => {
    // Arrange
    const user = new User({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    });
    await repository.create(user);

    // Act
    const foundUser = await repository.findByEmail('john@example.com');

    // Assert
    expect(foundUser).not.toBeNull();
    expect(foundUser?.Id).toBe('1');
    expect(foundUser?.Email).toBe('john@example.com');
  });

  it('should return null when email does not exist', async () => {
    // Act
    const foundUser = await repository.findByEmail('nonexistent@example.com');

    // Assert
    expect(foundUser).toBeNull();
  });
});

describe('InMemoryUserRepository - update', () => {
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
  });

  it('should update user properties successfully', async () => {
    // Arrange
    const user = new User({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    });
    await repository.create(user);

    // Act
    const updatedUser = await repository.update('1', {
      Name: 'John Updated',
      Email: 'johnupdated@example.com',
      Password: 'newpassword'
    });

    // Assert
    expect(updatedUser.Name).toBe('John Updated');
    expect(updatedUser.Email).toBe('johnupdated@example.com');
    expect(updatedUser.Password).toBe('newpassword');
    
    // Verify the update is persistent
    const foundUser = await repository.findById('1');
    expect(foundUser?.Name).toBe('John Updated');
  });

  it('should only update provided properties', async () => {
    // Arrange
    const user = new User({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    });
    await repository.create(user);

    // Act - only update name
    const updatedUser = await repository.update('1', {
      Name: 'John Updated'
    });

    // Assert
    expect(updatedUser.Name).toBe('John Updated');
    expect(updatedUser.Email).toBe('john@example.com'); // unchanged
    expect(updatedUser.Password).toBe('password123'); // unchanged
  });

  it('should throw error when updating non-existent user', async () => {
    // Act & Assert
    await expect(repository.update('nonexistent', {
      Name: 'Updated Name'
    })).rejects.toThrow('User not found');
  });
});

describe('InMemoryUserRepository - delete', () => {
  let repository: InMemoryUserRepository;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
  });

  it('should delete a user successfully', async () => {
    // Arrange
    const user = new User({
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    });
    await repository.create(user);
    
    // Verify user exists first
    let foundUser = await repository.findById('1');
    expect(foundUser).not.toBeNull();

    // Act
    await repository.delete('1');

    // Assert
    foundUser = await repository.findById('1');
    expect(foundUser).toBeNull();

    const allUsers = await repository.findAll();
    expect(allUsers.length).toBe(0);
  });

  it('should not throw error when deleting non-existent user', async () => {
    // Act & Assert
    await expect(repository.delete('nonexistent')).resolves.not.toThrow();
  });
});
