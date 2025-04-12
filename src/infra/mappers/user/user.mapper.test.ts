import { RoleEnum } from '@/common/enums/role.enum';
import { User } from '@/domain/entities/user.entity';
import { UserSchema } from '@/infra/database/mongodb/schemas/user.schema';
import { UserMapper } from './user.mapper';

describe('UserMapper', () => {
  it('Deve converter um UserSchema para um User', () => {
    const userSchema: UserSchema = {
      _id: 'user-id-1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashed_password',
      role: RoleEnum.USER,
    };

    const user = UserMapper.toDomain(userSchema);

    expect(user).toBeInstanceOf(User);
    expect(user.Id).toBe(userSchema._id);
    expect(user.Name).toBe(userSchema.name);
    expect(user.Email).toBe(userSchema.email);
    expect(user.Password).toBe(userSchema.password);
    expect(user.Role).toBe(userSchema.role);
  });

  it('Deve converter um User para UserSchema', () => {
    const user = new User({
      id: 'user-id-2',
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      password: 'another_hashed_password',
      role: RoleEnum.USER,
    });

    const userSchema = UserMapper.toPersistence(user);

    expect(userSchema).toBeInstanceOf(UserSchema);
    expect(userSchema._id).toBe(user.Id);
    expect(userSchema.name).toBe(user.Name);
    expect(userSchema.email).toBe(user.Email);
    expect(userSchema.password).toBe(user.Password);
    expect(userSchema.role).toBe(user.Role);
  });
});
