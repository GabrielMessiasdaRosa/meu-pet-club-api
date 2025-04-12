import { User } from '@/domain/entities/user.entity';
import { IUserRepository } from '@/domain/repositories/user.repository.interface';
import { UserMapper } from '@/infra/mappers/user/user.mapper';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSchemaDocument } from '../schemas/user.schema';

@Injectable()
export class MongooseUserRepository implements IUserRepository {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<UserSchemaDocument>,
  ) {}
  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      return null;
    }
    const userDomain = UserMapper.toDomain(user);
    return userDomain;
  }
  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().exec();
    const usersDomain = users.map((user) => UserMapper.toDomain(user));
    return usersDomain;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      return null;
    }
    const userDomain = UserMapper.toDomain(user);
    return userDomain;
  }

  async create(userData: User): Promise<User> {
    console.log('SIIIIUM');
    const user = new this.userModel(UserMapper.toPersistence(userData));
    const createdUser = await user.save();
    const userDomain = UserMapper.toDomain(createdUser);
    return userDomain;
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    console.log(id);
    const user = await this.userModel
      .findById({
        _id: id,
      })
      .exec();
    console.log('&&&&&&&&&&&&&&&', user);
    if (!user) {
      throw new Error('User not found');
    }

    const existingUser = UserMapper.toDomain(user);
    const updatedUserEntity = new User({
      id: existingUser.Id,
      name: userData.Name ?? existingUser.Name,
      email: userData.Email ?? existingUser.Email,
      password: userData.Password ?? existingUser.Password,
      role: userData.Role ?? existingUser.Role,
    });
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      UserMapper.toPersistence(updatedUserEntity),
      {
        new: true,
        runValidators: true,
      },
    );
    if (!updatedUser) {
      throw new Error('User not found');
    }
    const userDomain = UserMapper.toDomain(updatedUser);
    return userDomain;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new Error('User not found');
    }
  }

  async findByResetToken(id: string, resetToken: string): Promise<User | null> {
    const user = await this.userModel
      .findOne({
        _id: id,
      })
      .exec();
    if (!user) {
      throw new Error('User not found');
    }
    if (
      user.resetToken != resetToken ||
      !user.resetTokenExpires ||
      user.resetTokenExpires < new Date()
    ) {
      return null;
    }
    const userDomain = UserMapper.toDomain(user);
    return userDomain;
  }
}
