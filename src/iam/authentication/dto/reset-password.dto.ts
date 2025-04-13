import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUUID } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email da conta para redefinir a senha',
    example: 'usuario@exemplo.com',
    type: String,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Nova senha a ser definida',
    example: 'NovaSenha@123',
    type: String,
  })
  @IsString()
  newPassword: string;

  @ApiProperty({
    description: 'Token de redefinição de senha recebido por email',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsUUID()
  resetToken: string;
}
