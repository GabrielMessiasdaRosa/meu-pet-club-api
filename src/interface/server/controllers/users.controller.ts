import { CreateUserDto } from '@/application/dtos/user/create-user.dto';
import { UpdateMeDto } from '@/application/dtos/user/update-me.dto';
import { UpdateUserDto } from '@/application/dtos/user/update-user.dto';
import { UserService } from '@/application/services/user.service';
import { RoleEnum } from '@/common/enums/role.enum';
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
import { Roles } from 'src/iam/authorization/decorators/role.decorator';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';

@ApiBearerAuth()
@ApiTags('users')
@Auth(AuthType.Private)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Roles(RoleEnum.ADMIN, RoleEnum.ROOT)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  async findMe(@ActiveUser() user: ActiveUserData) {
    return await this.userService.findMe(user.sub);
  }

  @Patch('me')
  async updateMe(
    @ActiveUser() user: ActiveUserData,
    @Body() updateUserDto: UpdateMeDto,
  ) {
    return await this.userService.update(user.sub, updateUserDto);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.ROOT)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.ROOT)
  @Get(':id')
  findOne(@Param('id') id: string) {
    if (id === undefined) {
      return null;
    }
    return this.userService.findById(id);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.ROOT)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.ROOT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
