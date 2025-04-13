import { CreateUserDto } from '@/application/dtos/user/create-user.dto';
import { UpdateMeDto } from '@/application/dtos/user/update-me.dto';
import { UpdateUserDto } from '@/application/dtos/user/update-user.dto';
import { UserService } from '@/application/services/user.service';
import { RoleEnum } from '@/common/enums/role.enum';
import { User } from '@/domain/entities/user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
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
import { HateoasResource } from '../presenters/hateoas-resource.presenter';
import { UserPresenter } from '../presenters/users.presenter';

@ApiBearerAuth()
@ApiTags('users')
@Auth(AuthType.Private)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Roles(RoleEnum.ADMIN, RoleEnum.ROOT)
  @Get()
  async findAll(): Promise<HateoasResource<User[]>> {
    const users = await this.userService.findAll();
    return UserPresenter.toHateoasList(users);
  }

  @Get('me')
  async findMe(
    @ActiveUser() user: ActiveUserData,
  ): Promise<HateoasResource<User>> {
    const userData = await this.userService.findMe(user.sub);
    if (!userData) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }
    return UserPresenter.toHateoasMe(userData);
  }

  @Patch('me')
  async updateMe(
    @ActiveUser() user: ActiveUserData,
    @Body() updateUserDto: UpdateMeDto,
  ): Promise<HateoasResource<User>> {
    const updatedUser = await this.userService.update(user.sub, updateUserDto);
    if (!updatedUser) {
      throw new HttpException(
        'Erro ao atualizar usuário',
        HttpStatus.BAD_REQUEST,
      );
    }
    return UserPresenter.toHateoasMe(updatedUser);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.ROOT)
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<HateoasResource<User>> {
    const newUser = await this.userService.create(createUserDto);
    return UserPresenter.toHateoas(newUser);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.ROOT)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<HateoasResource<User>> {
    if (id === undefined) {
      throw new HttpException('ID não fornecido', HttpStatus.BAD_REQUEST);
    }
    const user = await this.userService.findById(id);
    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }
    return UserPresenter.toHateoas(user);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.ROOT)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<HateoasResource<User>> {
    const updatedUser = await this.userService.update(id, updateUserDto);
    if (!updatedUser) {
      throw new HttpException(
        'Erro ao atualizar usuário',
        HttpStatus.BAD_REQUEST,
      );
    }
    return UserPresenter.toHateoas(updatedUser);
  }

  @Roles(RoleEnum.ADMIN, RoleEnum.ROOT)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    // Primeiro buscamos o usuário
    const user = await this.userService.findById(id);
    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    // Executamos a operação de exclusão
    await this.userService.delete(id);

    // Retornamos uma mensagem de sucesso
    return { message: `Usuário com ID ${id} foi excluído com sucesso` };
  }
}
