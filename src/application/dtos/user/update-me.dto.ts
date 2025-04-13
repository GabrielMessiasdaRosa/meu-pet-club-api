import { IsOptional, IsString } from 'class-validator';

export class UpdateMeDto {
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
