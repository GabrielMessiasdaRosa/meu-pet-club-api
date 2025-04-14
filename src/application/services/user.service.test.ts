import { RoleEnum } from '@/common/enums/role.enum';
import { Pet } from '@/domain/entities/pet.entity';
import { User } from '@/domain/entities/user.entity';
import { HashingService } from '@/iam/hashing/hashing.service';
import { ActiveUserData } from '@/iam/interfaces/active-user-data.interface';
import { MongooseUserRepository } from '@/infra/database/mongodb/repositories/user.repository';
import { EmailService } from '@/infra/email/email.service';
import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { UpdateMeDto } from '../dtos/user/update-me.dto';
import { UpdateUserDto } from '../dtos/user/update-user.dto';
import { PetService } from './pet.service';
import { UserService } from './user.service';

describe('UserService Integration Tests', () => {
  let userService: UserService;
  let userRepository: MongooseUserRepository;
  let petService: PetService;
  let emailService: EmailService;

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

  // Mock do usuário USER para testes específicos
  const mockUserRole: ActiveUserData = {
    sub: 'user456',
    email: 'user@example.com',
    name: 'Normal User',
    role: RoleEnum.USER,
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
        {
          provide: EmailService,
          useValue: {
            sendUserCredentials: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn().mockResolvedValue('hashedPassword'),
            compare: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get('UserRepository');
    petService = module.get<PetService>(PetService);
    emailService = module.get<EmailService>(EmailService);
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

  it('should find a user by email', async () => {
    const user = new User({
      id: 'uuid',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    });

    jest.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(user);

    const result = await userService.findByEmail('john.doe@example.com');
    expect(result).toEqual(user);
    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      'john.doe@example.com',
    );
  });

  it('should throw ForbiddenException when ADMIN tries to create USER', async () => {
    const createUserDto: CreateUserDto = {
      name: 'Regular User',
      email: 'user@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    };

    await expect(
      userService.create(createUserDto, mockCurrentUser),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      userService.create(createUserDto, mockCurrentUser),
    ).rejects.toThrow('Usuários ADMIN não podem criar usuários do tipo USER');
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

  it('should update user when it is the same user updating their own info', async () => {
    const userId = 'user456';
    const existingUser = new User({
      id: userId,
      name: 'Normal User',
      email: 'user@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    });

    const updateMeDto: UpdateMeDto = {
      name: 'Updated User',
      email: 'updated.user@example.com',
    };

    const updatedUser = new User({
      id: userId,
      name: updateMeDto.name!,
      email: updateMeDto.email!,
      password: existingUser.Password,
      role: existingUser.Role,
    });

    jest.spyOn(userRepository, 'findById').mockResolvedValueOnce(existingUser);
    jest.spyOn(userRepository, 'update').mockResolvedValueOnce(updatedUser);

    const result = await userService.update(userId, updateMeDto, mockUserRole);
    expect(result).toEqual(updatedUser);
  });

  it('should throw ForbiddenException when ADMIN tries to update USER', async () => {
    const userId = 'user456';
    const existingUser = new User({
      id: userId,
      name: 'Normal User',
      email: 'user@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    });

    const updateUserDto: UpdateUserDto = {
      id: userId,
      name: 'Updated By Admin',
      email: 'updated.by.admin@example.com',
    };

    jest.spyOn(userRepository, 'findById').mockResolvedValue(existingUser);

    await expect(
      userService.update(userId, updateUserDto, mockCurrentUser),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      userService.update(userId, updateUserDto, mockCurrentUser),
    ).rejects.toThrow(
      'Usuários ADMIN não podem atualizar usuários do tipo USER',
    );
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

  it('should find current user information', async () => {
    const userId = 'user456';
    const user = new User({
      id: userId,
      name: 'Normal User',
      email: 'user@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    });

    jest.spyOn(userRepository, 'findById').mockResolvedValueOnce(user);

    const result = await userService.findMe(userId);
    expect(result).toEqual(user);
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
  });

  it('should find user with their pets', async () => {
    const userId = 'user456';
    const user = new User({
      id: userId,
      name: 'Normal User',
      email: 'user@example.com',
      password: 'password123',
      role: RoleEnum.USER,
    });

    const pets = [
      new Pet({
        id: 'pet1',
        name: 'Rex',
        type: 'dog',
        userId,
      }),
      new Pet({
        id: 'pet2',
        name: 'Whiskers',
        type: 'cat',
        userId,
      }),
    ];

    jest.spyOn(userRepository, 'findById').mockResolvedValueOnce(user);
    jest.spyOn(petService, 'findByUserId').mockResolvedValueOnce(pets);

    const result = await userService.findUserWithPets(userId);
    expect(result).toEqual({ user, pets });
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(petService.findByUserId).toHaveBeenCalledWith(userId);
  });

  it('should return null when user not found in findUserWithPets', async () => {
    jest.spyOn(userRepository, 'findById').mockResolvedValueOnce(null);

    const result = await userService.findUserWithPets('nonexistentId');
    expect(result).toBeNull();
    expect(petService.findByUserId).not.toHaveBeenCalled();
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
