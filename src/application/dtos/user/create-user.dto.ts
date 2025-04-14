import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { RoleEnum } from '../../../common/enums/role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Endereço de email do usuário (único no sistema)',
    example: 'joao.silva@exemplo.com',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'Senha@123',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Função do usuário no sistema',
    example: 'USER',
    enum: RoleEnum,
    enumName: 'RoleEnum',
  })
  @IsNotEmpty()
  role: RoleEnum;
}
