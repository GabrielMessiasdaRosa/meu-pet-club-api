import { RoleEnum } from '../../../common/enums/role.enum';
import { UserEntity } from '../../../domain/entities/user.entity';
import { CreateUserDto } from '../../dtos/user/create-user.dto';
import { UserMapper } from './user.mapper';

describe('UserMapper', () => {
  describe('toDomain', () => {
    it('should map a plain object to a UserEntity', () => {
      const input = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        role: RoleEnum.ADMIN,
      };

      const result = UserMapper.toDomain(input);

      expect(result).toBeInstanceOf(UserEntity);
      expect(result.Id).toBe(input.id);
      expect(result.Name).toBe(input.name);
      expect(result.Email).toBe(input.email);
      expect(result.Password).toBe(input.password);
      expect(result.Role).toBe(input.role);
    });
  });

  describe('toPersistence', () => {
    it('should map a UserEntity to a CreateUserDto', () => {
      const userEntity = new UserEntity({
        id: '1',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'securepassword',
        role: RoleEnum.USER,
      });

      const result = UserMapper.toPersistence(userEntity);

      expect(result).toBeInstanceOf(CreateUserDto);
      expect(result.id).toBe(userEntity.Id);
      expect(result.name).toBe(userEntity.Name);
      expect(result.email).toBe(userEntity.Email);
      expect(result.password).toBe(userEntity.Password);
      expect(result.role).toBe(userEntity.Role);
    });

    it('should default role to RoleEnum.USER if not provided', () => {
      const userEntity = new UserEntity({
        id: '2',
        name: 'John Smith',
        email: 'john.smith@example.com',
        password: 'anotherpassword',
        role: undefined,
      });

      const result = UserMapper.toPersistence(userEntity);
      expect(result.role).toBe(RoleEnum.USER);
    });
  });
});
