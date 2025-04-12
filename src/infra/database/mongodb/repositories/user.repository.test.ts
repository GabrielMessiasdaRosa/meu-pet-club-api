import { RoleEnum } from '@/common/enums/role.enum';
import { User } from '@/domain/entities/user.entity';
import { UserMapper } from '@/infra/mappers/user/user.mapper';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseUserRepository } from './user.repository';

describe('MongooseUserRepository', () => {
  let repository: MongooseUserRepository;
  let userModel: any;

  const mockUser = {
    _id: '5f7c7b5e9d3e2a1a1c9b4b1a',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: RoleEnum.USER,
  };

  const mockUserDomain = new User({
    id: '5f7c7b5e9d3e2a1a1c9b4b1a',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: RoleEnum.USER,
  });

  beforeEach(async () => {
    userModel = function () {
      return {
        save: jest.fn().mockResolvedValue(mockUser),
      };
    };
    userModel.findById = jest.fn();
    userModel.find = jest.fn();
    userModel.findOne = jest.fn();
    userModel.findByIdAndUpdate = jest.fn();
    userModel.findByIdAndDelete = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongooseUserRepository,
        {
          provide: getModelToken('User'),
          useValue: userModel,
        },
      ],
    }).compile();

    repository = module.get<MongooseUserRepository>(MongooseUserRepository);

    // Mock the UserMapper methods
    jest.spyOn(UserMapper, 'toDomain').mockReturnValue(mockUserDomain);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      // Arrange
      const id = '5f7c7b5e9d3e2a1a1c9b4b1a';
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      // Act
      const result = await repository.findById(id);

      // Assert
      expect(userModel.findById).toHaveBeenCalledWith(id);
      expect(UserMapper.toDomain).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUserDomain);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const id = 'non-existent-id';
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Act
      const result = await repository.findById(id);

      // Assert
      expect(userModel.findById).toHaveBeenCalledWith(id);
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      // Arrange
      userModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockUser]),
      });

      // Act
      const result = await repository.findAll();

      // Assert
      expect(userModel.find).toHaveBeenCalled();
      expect(UserMapper.toDomain).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual([mockUserDomain]);
    });
  });

  describe('findByEmail', () => {
    it('should return a user when email is found', async () => {
      // Arrange
      const email = 'john@example.com';
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      // Act
      const result = await repository.findByEmail(email);

      // Assert
      expect(userModel.findOne).toHaveBeenCalledWith({ email });
      expect(UserMapper.toDomain).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUserDomain);
    });

    it('should return null when email not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      userModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Act
      const result = await repository.findByEmail(email);

      // Assert
      expect(userModel.findOne).toHaveBeenCalledWith({ email });
      expect(result).toBeNull();
    });
  });
  describe('create', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      jest.spyOn(UserMapper, 'toPersistence').mockReturnValue(mockUser);

      // Act
      const result = await repository.create(mockUserDomain);
      // Act

      // Assert
      expect(UserMapper.toPersistence).toHaveBeenCalledWith(mockUserDomain);
      expect(UserMapper.toDomain).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUserDomain);
    });
  });

  describe('update', () => {
    it('should update user properties successfully', async () => {
      // Arrange
      const id = '5f7c7b5e9d3e2a1a1c9b4b1a';
      const updateData = { Name: 'John Updated' };

      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      userModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockUser,
          name: 'John Updated',
        }),
      });

      // Act
      const result = await repository.update(id, updateData);

      // Assert
      expect(userModel.findById).toHaveBeenCalledWith({ _id: id });
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(id, mockUser, {
        new: true,
        runValidators: true,
      });
      expect(result).toEqual(mockUserDomain);
    });

    it('should throw an error when user not found during find', async () => {
      // Arrange
      const id = 'non-existent-id';
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Act & Assert
      await expect(
        repository.update(id, { Name: 'John Updated' }),
      ).rejects.toThrow('User not found');
    });

    it('should throw an error when user not found during update', async () => {
      // Arrange
      const id = '5f7c7b5e9d3e2a1a1c9b4b1a';
      const updateData = { Name: 'John Updated' };
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(repository.update(id, updateData)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      // Arrange
      const id = '5f7c7b5e9d3e2a1a1c9b4b1a';
      userModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      // Act
      await repository.delete(id);

      // Assert
      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    });

    it('should throw error when deleting non-existent user', async () => {
      // Arrange
      const id = 'non-existent-id';
      userModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Act & Assert
      await expect(repository.delete(id)).rejects.toThrow('User not found');
    });
  });
  describe('findByResetToken', () => {
    it('should return a user when reset token is valid and not expired', async () => {
      // Arrange
      const id = '5f7c7b5e9d3e2a1a1c9b4b1a';
      const resetToken = 'valid-token';
      const mockUserWithResetToken = {
      ...mockUser,
      resetToken: 'valid-token',
      resetTokenExpires: new Date(Date.now() + 3600000), // 1 hour in the future
      };
      
      userModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUserWithResetToken),
      });

      // Act
      const result = await repository.findByResetToken(id, resetToken);

      // Assert
      expect(userModel.findOne).toHaveBeenCalledWith({ _id: id });
      expect(UserMapper.toDomain).toHaveBeenCalledWith(mockUserWithResetToken);
      expect(result).toEqual(mockUserDomain);
    });

    it('should return null when reset token does not match', async () => {
      // Arrange
      const id = '5f7c7b5e9d3e2a1a1c9b4b1a';
      const resetToken = 'wrong-token';
      const mockUserWithResetToken = {
      ...mockUser,
      resetToken: 'valid-token',
      resetTokenExpires: new Date(Date.now() + 3600000), // 1 hour in the future
      };
      
      userModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUserWithResetToken),
      });

      // Act
      const result = await repository.findByResetToken(id, resetToken);

      // Assert
      expect(userModel.findOne).toHaveBeenCalledWith({ _id: id });
      expect(result).toBeNull();
    });

    it('should return null when reset token is expired', async () => {
      // Arrange
      const id = '5f7c7b5e9d3e2a1a1c9b4b1a';
      const resetToken = 'valid-token';
      const mockUserWithResetToken = {
      ...mockUser,
      resetToken: 'valid-token',
      resetTokenExpires: new Date(Date.now() - 3600000), // 1 hour in the past
      };
      
      userModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUserWithResetToken),
      });

      // Act
      const result = await repository.findByResetToken(id, resetToken);

      // Assert
      expect(userModel.findOne).toHaveBeenCalledWith({ _id: id });
      expect(result).toBeNull();
    });

    it('should return null when reset token expiration is not set', async () => {
      // Arrange
      const id = '5f7c7b5e9d3e2a1a1c9b4b1a';
      const resetToken = 'valid-token';
      const mockUserWithResetToken = {
      ...mockUser,
      resetToken: 'valid-token',
      resetTokenExpires: null,
      };
      
      userModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUserWithResetToken),
      });

      // Act
      const result = await repository.findByResetToken(id, resetToken);

      // Assert
      expect(userModel.findOne).toHaveBeenCalledWith({ _id: id });
      expect(result).toBeNull();
    });

    it('should throw an error when user is not found', async () => {
      // Arrange
      const id = 'non-existent-id';
      const resetToken = 'valid-token';
      
      userModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
      });

      // Act & Assert
      await expect(repository.findByResetToken(id, resetToken))
      .rejects.toThrow('User not found');
      expect(userModel.findOne).toHaveBeenCalledWith({ _id: id });
    });
  });
});
