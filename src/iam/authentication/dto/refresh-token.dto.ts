import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Token de atualização para obter um novo token de acesso',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlJlZnJlc2ggVG9rZW4iLCJpYXQiOjE1MTYyMzkwMjJ9.BmqCDYaxAH0Pv4AduWRx3OPqnxQNr4bOV4i8hCUl0nw',
    type: String,
  })
  @IsNotEmpty()
  refreshToken: string;
}
