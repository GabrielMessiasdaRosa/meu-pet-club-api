import { User } from '@/domain/entities/user.entity';
import { UserSchema } from '@/infra/database/mongodb/schemas/user.schema';

export class UserMapper {
  static toDomain(schema: UserSchema): User {
    const domain = new User({
      id: schema._id,
      name: schema.name,
      email: schema.email,
      password: schema.password,
      role: schema.role,
    });
    if (schema.resetToken) {
      domain.setResetToken(schema.resetToken);
    }
    if (schema.resetTokenExpires) {
      domain.setResetTokenExpires(schema.resetTokenExpires);
    }
    console.log(domain);
    return domain;
  }

  static toPersistence(domain: User): UserSchema {
    const schema = new UserSchema();
    schema._id = domain.Id;
    schema.name = domain.Name;
    schema.email = domain.Email;
    schema.password = domain.Password;
    schema.role = domain.Role;
    return schema;
  }
}
