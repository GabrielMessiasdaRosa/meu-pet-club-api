import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsNumber()
  @IsOptional()
  age?: number;
}
