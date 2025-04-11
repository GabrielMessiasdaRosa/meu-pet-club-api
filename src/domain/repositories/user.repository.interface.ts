import { UserEntity } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(userData: UserEntity): Promise<UserEntity>;
  update(id: string, userData: UserEntity): Promise<UserEntity>;
  delete(id: string): Promise<void>;
}
