import { UpdateUserDto } from '@/application/dtos/user/update-user.dto';
import { UserService } from '@/application/services/user.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/iam/authentication/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentication/enums/auth-type.enum';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';

@ApiBearerAuth()
@ApiTags('users')
@Auth(AuthType.Private)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  async findMe(@ActiveUser() user: ActiveUserData) {
    return await this.userService.findMe(user.sub);
  }

  @Post('me/:id')
  async updateMe(
    @ActiveUser() user: ActiveUserData,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(user.sub, updateUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (id === undefined) {
      return null;
    }
    return this.userService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
