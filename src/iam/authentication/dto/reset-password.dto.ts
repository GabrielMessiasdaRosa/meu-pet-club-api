import { IsEmail, IsString, IsUUID } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;
  
  @IsString()
  newPassword: string;

  @IsUUID()
  resetToken: string;
}
