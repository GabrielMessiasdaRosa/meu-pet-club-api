import { RoleEnum } from '../../common/enums/role.enum';

export class UserEntity {
  private readonly id: string;
  private name: string;
  private email: string;
  private password: string;
  private role: RoleEnum;

  constructor(userData: {
    id: string;
    name: string;
    email: string;
    password: string;
    role: RoleEnum;
  }) {
    this.id = userData.id;
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this.role = userData.role;
    this.validate();
  }
  private validate() {
    const validRoles = Object.values(RoleEnum);
    if (!validRoles.includes(this.role)) {
      throw new Error('Role inválida');
    }

    if (!this.name) {
      throw new Error('Nome é obrigatório');
    }

    if (!this.email) {
      throw new Error('Email é obrigatório');
    }

    if (!this.password) {
      throw new Error('Senha é obrigatória');
    }

    if (!this.id) {
      throw new Error('ID é obrigatório');
    }
  }

  // getters

  get Id(): string {
    return this.id;
  }
  get Name(): string {
    return this.name;
  }
  get Email(): string {
    return this.email;
  }
  get Password(): string {
    return this.password;
  }
  get Role(): RoleEnum {
    return this.role;
  }

  //setters
  public setName(name: string): void {
    if (!name) {
      throw new Error('Nome é obrigatório');
    }
    this.name = name;
  }
  public setEmail(email: string): void {
    if (!email) {
      throw new Error('Email é obrigatório');
    }
    this.email = email;
  }
  public setPassword(password: string): void {
    if (!password) {
      throw new Error('Senha é obrigatória');
    }
    this.password = password;
  }
}
