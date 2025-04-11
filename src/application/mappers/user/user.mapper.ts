import { RoleEnum } from '../../../common/enums/role.enum';
import { UserEntity } from '../../../domain/entities/user.entity';
import { CreateUserDto } from '../../dtos/user/create-user.dto';

export class UserMapper {
  static toDomain(user: any): UserEntity {
    return new UserEntity({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
    });
  }

  static toPersistence(user: UserEntity): CreateUserDto {
    const output = new CreateUserDto();
    output.id = user.Id;
    output.name = user.Name;
    output.email = user.Email;
    output.password = user.Password;
    output.role = user.Role || RoleEnum.USER;
    return output;
  }
}
