import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;
}
