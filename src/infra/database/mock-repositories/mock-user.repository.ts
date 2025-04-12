import { User } from '@/domain/entities/user.entity';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((user) => user.Id === id) || null;
    if (!user) {
      return null;
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((user) => user.Email === email) || null;
  }

  async create(userData: User): Promise<User> {
    const existingUser = await this.findById(userData.Id);
    if (existingUser) {
      throw new Error('User already exists');
    }
    const newUser = new User({
      id: userData.Id,
      name: userData.Name,
      email: userData.Email,
      password: userData.Password,
      role: userData.Role,
    });
    this.users.push(newUser);
    return newUser;
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    // busca no banco
    const user = await this.findById(id);

    if (!user) {
      throw new Error('User not found');
    }
    // atualiza os dados
    user.setName(userData.Name || user.Name);
    user.setEmail(userData.Email || user.Email);
    user.setPassword(userData.Password || user.Password);

    return user;
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter((user) => user.Id !== id);
  }
}
