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
