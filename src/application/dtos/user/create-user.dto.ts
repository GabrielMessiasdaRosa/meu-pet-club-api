import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { RoleEnum } from '../../../common/enums/role.enum';

export class CreateUserDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  role: RoleEnum;
}
