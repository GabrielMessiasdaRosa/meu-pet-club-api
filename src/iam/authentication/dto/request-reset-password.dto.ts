import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'Email da conta para qual deseja redefinir a senha',
    example: 'usuario@exemplo.com',
    type: String,
  })
  @IsEmail()
  email: string;
}
