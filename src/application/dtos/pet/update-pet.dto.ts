import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdatePetDto {
  @ApiProperty({
    description: 'ID único do pet',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Novo nome do pet',
    example: 'Max',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Novo tipo de animal',
    example: 'Gato',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    description: 'Nova raça do pet',
    example: 'Siamês',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  breed?: string;

  @ApiProperty({
    description: 'Nova idade do pet em anos',
    example: 5,
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  age?: number;
}
