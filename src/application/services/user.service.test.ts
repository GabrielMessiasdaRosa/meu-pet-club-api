import { RoleEnum } from '@/common/enums/role.enum';
import { User } from '@/domain/entities/user.entity';
import { MongooseUserRepository } from '@/infra/database/mongodb/repositories/user.repository';
import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { UpdateUserDto } from '../dtos/user/update-user.dto';
import { PetService } from './pet.service';
import { UserService } from './user.service';

describe('UserService Integration Tests', () => {
  let userService: UserService;
  let userRepository: MongooseUserRepository;
  let petService: PetService;

  // Mock do usuário autenticado para os testes
  const mockCurrentUser: ActiveUserData = {
    sub: 'user123',
    email: 'admin@example.com',
    name: 'Admin User',
    role: RoleEnum.ADMIN,
  };

  // Mock do usuário ROOT para testes específicos
  const mockRootUser: ActiveUserData = {
    sub: 'root123',
    email: 'root@example.com',
    name: 'Root User',
    role: RoleEnum.ROOT,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'UserRepository',
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn().mockImplementation((dto) =>
              Promise.resolve({
                ...dto,
                id: 'uuid',
                password: 'hashedPassword',
              }),
            ),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: PetService,
          useValue: {
            findByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get('UserRepository');
    petService = module.get<PetService>(PetService);
  });

  it('should create a new USER role user by ROOT', async () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    };

    const result = await userService.create(createUserDto, mockRootUser);

    expect(result).toEqual(
      new User({ ...createUserDto, id: 'uuid', password: 'hashedPassword' }),
    );
  });

  it('should create a new ADMIN role user by ROOT user', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Admin User',
      email: 'admin.new@example.com',
      password: 'password123',
      role: RoleEnum.ADMIN,
    };

    const result = await userService.create(createUserDto, mockRootUser);

    expect(result).toEqual(
      new User({ ...createUserDto, id: 'uuid', password: 'hashedPassword' }),
    );
  });

  it('should create a new ROOT role user by ROOT user', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Root User',
      email: 'root.new@example.com',
      password: 'password123',
      role: RoleEnum.ROOT,
    };

    const result = await userService.create(createUserDto, mockRootUser);

    expect(result).toEqual(
      new User({ ...createUserDto, id: 'uuid', password: 'hashedPassword' }),
    );
  });

  it('should throw ForbiddenException when ADMIN tries to create ROOT user', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Root User Attempt',
      email: 'root.attempt@example.com',
      password: 'password123',
      role: RoleEnum.ROOT,
    };

    await expect(
      userService.create(createUserDto, mockCurrentUser),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should find a user by ID', async () => {
    const user = new User({
      id: 'uuid',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    });

    jest.spyOn(userRepository, 'findById').mockResolvedValueOnce(user);

    const result = await userService.findById('uuid');
    expect(result).toEqual(user);
  });

  it('should update a user', async () => {
    const existingUser = new User({
      id: 'uuid',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    });

    const updateUserDto: UpdateUserDto = {
      id: 'uuid',
      name: 'John Updated',
      email: 'john.updated@example.com',
    };

    const updatedUser = new User({
      id: 'uuid',
      name: updateUserDto.name!,
      email: updateUserDto.email!,
      password: existingUser.Password,
      role: existingUser.Role,
    });

    jest.spyOn(userRepository, 'findById').mockResolvedValueOnce(existingUser);
    jest.spyOn(userRepository, 'update').mockResolvedValueOnce(updatedUser);

    const result = await userService.update('uuid', updateUserDto);
    expect(result).toEqual(updatedUser);
  });

  it('should delete a user', async () => {
    const user = new User({
      id: 'uuid',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    });

    jest.spyOn(userRepository, 'findById').mockResolvedValueOnce(user);
    jest.spyOn(userRepository, 'delete').mockResolvedValueOnce(undefined);

    await expect(userService.delete(user.Id)).resolves.not.toThrow();
    expect(userRepository.delete).toHaveBeenCalledWith(user.Id);
  });

  it('should find all users', async () => {
    const users = [
      new User({
        id: 'uuid1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: RoleEnum.USER,
      }),
      new User({
        id: 'uuid2',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        role: RoleEnum.ADMIN,
      }),
    ];

    jest.spyOn(userRepository, 'findAll').mockResolvedValueOnce(users);

    const result = await userService.findAll();

    expect(result).toEqual(users);
  });
});
