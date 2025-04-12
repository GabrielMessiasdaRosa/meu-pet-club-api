import { CreateUserDto } from '@/application/dtos/user/create-user.dto';
import { UpdateUserDto } from '@/application/dtos/user/update-user.dto';
import { RoleEnum } from '@/common/enums/role.enum';
import { User } from '@/domain/entities/user.entity';
import { v4 as uuid } from 'uuid';
import { InMemoryUserRepository } from './mock-user.repository';
describe('InMemoryUserRepository', () => {
  it('Deve criar um usuário com sucesso na memoria', async () => {
    const userRepository = new InMemoryUserRepository();

    const newUserDTO: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    };
    const newUser = new User({
      id: '123',
      name: newUserDTO.name,
      email: newUserDTO.email,
      password: newUserDTO.password,
      role: newUserDTO.role,
    });
    const createdUser = await userRepository.create(newUser);

    expect(createdUser).toHaveProperty('id', expect.any(String));
    expect(createdUser).toHaveProperty('name', 'Test User');
    expect(createdUser).toHaveProperty('email', 'test@example.com');
    expect(createdUser).toHaveProperty('password', 'password123');
    expect(createdUser).toHaveProperty('role', RoleEnum.USER);
  });

  it('Deve retornar null ao buscar um usuário inexistente', async () => {
    const userRepository = new InMemoryUserRepository();

    const createdUser = await userRepository.findById('non-existent-id');
    expect(createdUser).toBeNull();
  });

  it('Deve retornar todos os usuários', async () => {
    const newUser1: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    };

    const newUser2: CreateUserDto = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password456',
      role: RoleEnum.USER,
    };
    const user1 = new User({
      id: uuid(),
      name: newUser1.name,
      email: newUser1.email,
      password: newUser1.password,
      role: newUser1.role,
    });
    const user2 = new User({
      id: uuid(),
      name: newUser2.name,
      email: newUser2.email,
      password: newUser2.password,
      role: newUser2.role,
    });
    const userRepository = new InMemoryUserRepository();
    await userRepository.create(user1);
    await userRepository.create(user2);

    const users = await userRepository.findAll();

    expect(users).toHaveLength(2);
    expect(users).toEqual(expect.arrayContaining([user1, user2]));
  });

  it('Deve atualizar um usuário com sucesso', async () => {
    const userRepository = new InMemoryUserRepository();
    const newUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'email@email.com',
      password: '321654',
      role: RoleEnum.USER,
    };

    const newUser = new User({
      id: '123',
      name: newUserDto.name,
      email: newUserDto.email,
      password: newUserDto.password,
      role: newUserDto.role,
    });

    const createdUser = await userRepository.create(newUser);

    const payload: UpdateUserDto = {
      id: createdUser.Id,
      name: 'Updated Test User',
      email: createdUser.Email,
      password: createdUser.Password,
    };

    const updatedUserData: Partial<User> = {
      Name: payload.name,
      Email: payload.email,
      Password: payload.password,
    };

    const updatedUser = await userRepository.update(
      createdUser.Id,
      updatedUserData,
    );
    expect(updatedUser).toHaveProperty('id', '123');
    expect(updatedUser).toHaveProperty('name', 'Updated Test User');
    expect(updatedUser).toHaveProperty('email', 'email@email.com');
    expect(updatedUser).toHaveProperty('password', '321654');
    expect(updatedUser).toHaveProperty('role', RoleEnum.USER);
  });
});
