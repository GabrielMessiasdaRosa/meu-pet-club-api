import { CreateUserDto } from '@/application/dtos/user/create-user.dto';
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

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get()
  async getUsers() {
    return this.userService.findAll();
  }

  @Post()
  async createUser(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userService.update(id, body);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
