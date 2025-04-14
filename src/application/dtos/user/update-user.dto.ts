import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'ID único do usuário',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Novo nome do usuário',
    example: 'Maria Santos',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Novo endereço de email do usuário',
    example: 'maria.santos@exemplo.com',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Nova senha do usuário',
    example: 'NovaSenha@456',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;
}
