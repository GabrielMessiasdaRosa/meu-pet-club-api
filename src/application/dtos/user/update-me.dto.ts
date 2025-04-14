import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMeDto {
  @ApiProperty({
    description: 'Novo nome do usuário',
    example: 'Carlos Oliveira',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Novo endereço de email',
    example: 'carlos.oliveira@exemplo.com',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Nova senha',
    example: 'MinhaNovaSenha@789',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;
}
