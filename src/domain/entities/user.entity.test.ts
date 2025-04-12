import { RoleEnum } from '../../common/enums/role.enum';
import { User } from './user.entity';

describe('User Entity', () => {
  it('Deve lançar um erro ao tentar criar um usuário sem nome', () => {
    const userData = {
      id: '123',
      name: '',
      email: 'email@email.com',
      password: '321654',
      role: RoleEnum.USER,
    };

    expect(() => new User(userData)).toThrow('Nome é obrigatório');
  });

  it('Deve lançar um erro ao tentar criar um usuário sem email', () => {
    const userData = {
      id: '123',
      name: 'John Doe',
      email: '',
      password: '321654',
      role: RoleEnum.USER,
    };

    expect(() => new User(userData)).toThrow('Email é obrigatório');
  });

  it('Deve lançar um erro ao tentar criar um usuário sem senha', () => {
    const userData = {
      id: '123',
      name: 'John Doe',
      email: 'email@email.com',
      password: '',
      role: RoleEnum.USER,
    };

    expect(() => new User(userData)).toThrow('Senha é obrigatória');
  });

  it('Deve lançar um erro ao tentar criar um usuário sem ID', () => {
    const userData = {
      id: '',
      name: 'John Doe',
      email: 'email@email.com',
      password: '321654',
      role: RoleEnum.USER,
    };

    expect(() => new User(userData)).toThrow('ID é obrigatório');
  });

  it('Deve lançar um erro ao tentar criar um usuário sem email', () => {
    const userData = {
      id: '123',
      name: 'John Doe',
      email: '',
      password: '321654',
      role: RoleEnum.USER,
    };

    expect(() => new User(userData)).toThrow('Email é obrigatório');
  });

  it('Deve criar um usuário com sucesso', () => {
    const userData = {
      id: '123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'securePassword',
      role: RoleEnum.USER,
    };

    const user = new User(userData);

    expect(user).toBeInstanceOf(User);
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

    const user = new User(userData);
    expect(user).toBeInstanceOf(User);
    expect(user.Name).toBe(userData.name);
    expect(user.Email).toBe(userData.email);
    expect(user.Password).toBe(userData.password);
    expect(user.Id).toBe(userData.id);
    expect(user.Role).toBe(RoleEnum.ADMIN);
  });

  it('Deve lançar um erro ao tentar atualizar o nome do usuário para um valor inválido', () => {
    const userData = {
      id: '123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'securePassword',
      role: RoleEnum.USER,
    };

    const user = new User(userData);
    expect(() => user.setName('')).toThrow('Nome é obrigatório');
  });

  it('Deve lançar um erro ao tentar atualizar o email do usuário para um valor inválido', () => {
    const userData = {
      id: '123',
      name: 'John Doe',
      email: 'email@email.com',
      password: 'securePassword',
      role: RoleEnum.USER,
    };

    const user = new User(userData);
    expect(() => user.setEmail('')).toThrow('Email é obrigatório');
  });

  it('Deve lançar um erro ao tentar atualizar a senha do usuário para um valor inválido', () => {
    const userData = {
      id: '123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: '123123',
      role: RoleEnum.USER,
    };

    const user = new User(userData);
    expect(() => user.setPassword('')).toThrow('Senha é obrigatória');
  });

  it('Deve lançar um erro ao tentar criar um usuário com um papel inválido', () => {
    const userData = {
      id: '125',
      name: 'Invalid Role User',
      email: 'invalid.role@example.com',
      password: 'password',
      role: 'INVALID_ROLE' as RoleEnum, // Simulando um papel inválido
    };

    expect(() => new User(userData)).toThrow('Role inválida');
  });
});
