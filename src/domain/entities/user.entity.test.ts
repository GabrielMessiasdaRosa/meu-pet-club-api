import { RoleEnum } from '../../common/enums/role.enum';
import { UserEntity } from './user.entity';

describe('User Entity', () => {
  it('Deve lançar um erro ao tentar criar um usuário sem nome', () => {
    const userData = {
      id: '123',
      name: '',
      email: 'email@email.com',
      password: '321654',
      role: RoleEnum.USER,
    };

    expect(() => new UserEntity(userData)).toThrow('Nome é obrigatório');
  });

  it('Deve lançar um erro ao tentar criar um usuário sem email', () => {
    const userData = {
      id: '123',
      name: 'John Doe',
      email: '',
      password: '321654',
      role: RoleEnum.USER,
    };

    expect(() => new UserEntity(userData)).toThrow('Email é obrigatório');
  });

  it('Deve lançar um erro ao tentar criar um usuário sem senha', () => {
    const userData = {
      id: '123',
      name: 'John Doe',
      email: 'email@email.com',
      password: '',
      role: RoleEnum.USER,
    };

    expect(() => new UserEntity(userData)).toThrow('Senha é obrigatória');
  });

  it('Deve lançar um erro ao tentar criar um usuário sem ID', () => {
    const userData = {
      id: '',
      name: 'John Doe',
      email: 'email@email.com',
      password: '321654',
      role: RoleEnum.USER,
    };

    expect(() => new UserEntity(userData)).toThrow('ID é obrigatório');
  });

  it('Deve lançar um erro ao tentar criar um usuário sem email', () => {
    const userData = {
      id: '123',
      name: 'John Doe',
      email: '',
      password: '321654',
      role: RoleEnum.USER,
    };

    expect(() => new UserEntity(userData)).toThrow('Email é obrigatório');
  });

  it('Deve criar um usuário com sucesso', () => {
    const userData = {
      id: '123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'securePassword',
      role: RoleEnum.USER,
    };

    const user = new UserEntity(userData);

    expect(user).toBeInstanceOf(UserEntity);
    expect(user.Name).toBe(userData.name);
    expect(user.Email).toBe(userData.email);
    expect(user.Password).toBe(userData.password);
    expect(user.Id).toBe(userData.id);
    expect(user.Role).toBe(RoleEnum.USER);
  });

  it('Deve criar um usuário com role ADMIN', () => {
    const userData = {
      id: '124',
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'adminPassword',
      role: RoleEnum.ADMIN,
    };

    const user = new UserEntity(userData);
    expect(user).toBeInstanceOf(UserEntity);
    expect(user.Name).toBe(userData.name);
    expect(user.Email).toBe(userData.email);
    expect(user.Password).toBe(userData.password);
    expect(user.Id).toBe(userData.id);
    expect(user.Role).toBe(RoleEnum.ADMIN);
  });
});
