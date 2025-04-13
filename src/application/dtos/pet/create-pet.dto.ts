import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePetDto {
  @ApiProperty({
    description: 'Nome do pet',
    example: 'Rex',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Tipo de animal (ex: gato, cachorro, etc)',
    example: 'Cachorro',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Raça do pet',
    example: 'Golden Retriever',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  breed?: string;

  @ApiProperty({
    description: 'Idade do pet em anos',
    example: 3,
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  age?: number;
}
