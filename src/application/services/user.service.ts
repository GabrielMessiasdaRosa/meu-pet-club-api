import { User } from '@/domain/entities/user.entity';
import { MongooseUserRepository } from '@/infra/database/mongodb/repositories/user.repository';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { UpdateUserDto } from '../dtos/user/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: MongooseUserRepository,
  ) {}

  async findAll() {
    return await this.userRepository.findAll();
  }

  async findById(id: string) {
    return await this.userRepository.findById(id);
  }

  async findByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  async create(userData: CreateUserDto) {
    const newUser = new User({
      id: uuid(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
    });
    return await this.userRepository.create(newUser);
  }

  async update(id: string, userData: UpdateUserDto) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    const existingUser = new User({
      id: user.Id,
      name: user.Name,
      email: user.Email,
      password: user.Password,
      role: user.Role,
    });

    existingUser.setName(userData.name ?? existingUser.Name);
    existingUser.setEmail(userData.email ?? existingUser.Email);
    existingUser.setPassword(userData.password ?? existingUser.Password);

    return await this.userRepository.update(id, existingUser);
  }

  async findMe(id: string) {
    return await this.userRepository.findById(id);
  }

  async delete(id: string) {
    return await this.userRepository.delete(id);
  }
}
