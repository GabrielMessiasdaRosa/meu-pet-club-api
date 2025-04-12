import { RoleEnum } from '../../common/enums/role.enum';

export class User {
  private readonly id: string;
  private name: string;
  private email: string;
  private password: string;
  private readonly role: RoleEnum;
  private resetToken?: string;
  private resetTokenExpires?: Date;

  constructor(userData: {
    id: string;
    name: string;
    email: string;
    password: string;
    role: RoleEnum;
    resetToken?: string;
    resetTokenExpires?: Date;
  }) {
    this.id = userData.id;
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this.role = userData.role;
    this.resetToken = userData.resetToken;
    this.resetTokenExpires = userData.resetTokenExpires;
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
    if (!!this.resetToken) {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(this.resetToken)) {
        throw new Error('Token de redefinição inválido');
      }
    }
    if (this.resetTokenExpires && !this.resetToken) {
      throw new Error('Token de redefinição é obrigatório');
    }

    if (this.resetToken && !this.resetTokenExpires) {
      throw new Error('Data de expiração é obrigatória');
    }
  }
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
  get ResetToken(): string | undefined {
    return this.resetToken;
  }
  get ResetTokenExpires(): Date | undefined {
    return this.resetTokenExpires;
  }

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
  public setResetToken(token: string): void {
    if (!token) {
      throw new Error('Token de redefinição é obrigatório');
    }
    this.resetToken = token;
  }
  public setResetTokenExpires(expires: Date): void {
    if (!expires) {
      throw new Error('Data de expiração é obrigatória');
    }
    this.resetTokenExpires = expires;
  }
}
