import { CreateUserDto } from '@/application/dtos/user/create-user.dto';
import { UpdateMeDto } from '@/application/dtos/user/update-me.dto';
import { UpdateUserDto } from '@/application/dtos/user/update-user.dto';
import { PetService } from '@/application/services/pet.service';
import { UserService } from '@/application/services/user.service';
import {
  ApiCreateUser,
  ApiDeleteUser,
  ApiGetCurrentUser,
  ApiGetUserById,
  ApiListAllUsers,
  ApiUpdateCurrentUser,
  ApiUpdateUser,
} from '@/common/decorators/swagger';
import { RoleEnum } from '@/common/enums/role.enum';
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
import {
  UserPresenter,
  UserWithoutPassword,
} from '../presenters/users.presenter';

@ApiBearerAuth()
@ApiTags('users')
@Auth(AuthType.Private)
@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UserService,
    private readonly petService: PetService,
  ) {}

  @ApiListAllUsers()
  @Roles(RoleEnum.ADMIN, RoleEnum.ROOT)
  @Get()
  async findAll(): Promise<HateoasResource<UserWithoutPassword[]>> {
    const users = await this.userService.findAll();

    // Busca os pets para cada usuário e cria um mapa
    const usersPets = new Map();
    for (const user of users) {
      const pets = await this.petService.findByUserId(user.Id);
      if (pets.length > 0) {
        usersPets.set(user.Id, pets);
      }
    }

    return UserPresenter.toHateoasList(users, usersPets);
  }

  @ApiGetCurrentUser()
  @Get('me')
  async findMe(
    @ActiveUser() user: ActiveUserData,
  ): Promise<HateoasResource<UserWithoutPassword>> {
    const userData = await this.userService.findMe(user.sub);
    if (!userData) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    // Busca os pets do usuário
    const pets = await this.petService.findByUserId(userData.Id);

    return UserPresenter.toHateoasMe(userData, pets);
  }

  @ApiUpdateCurrentUser()
  @Patch('me')
  async updateMe(
    @ActiveUser() user: ActiveUserData,
    @Body() updateUserDto: UpdateMeDto,
  ): Promise<HateoasResource<UserWithoutPassword>> {
    const updatedUser = await this.userService.update(user.sub, updateUserDto);
    if (!updatedUser) {
      throw new HttpException(
        'Erro ao atualizar usuário',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Busca os pets do usuário
    const pets = await this.petService.findByUserId(updatedUser.Id);

    return UserPresenter.toHateoasMe(updatedUser, pets);
  }

  @ApiCreateUser()
  @Roles(RoleEnum.ADMIN, RoleEnum.ROOT)
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @ActiveUser() currentUser: ActiveUserData,
  ): Promise<HateoasResource<UserWithoutPassword>> {
    const newUser = await this.userService.create(createUserDto, currentUser);
    return UserPresenter.toHateoas(newUser);
  }

  @ApiGetUserById()
  @Roles(RoleEnum.ADMIN, RoleEnum.ROOT)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<HateoasResource<UserWithoutPassword>> {
    if (id === undefined) {
      throw new HttpException('ID não fornecido', HttpStatus.BAD_REQUEST);
    }
    const user = await this.userService.findById(id);
    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    // Busca os pets do usuário
    const pets = await this.petService.findByUserId(user.Id);

    return UserPresenter.toHateoas(user, pets);
  }

  @ApiUpdateUser()
  @Roles(RoleEnum.ADMIN, RoleEnum.ROOT)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @ActiveUser() activeUser: ActiveUserData,
  ): Promise<HateoasResource<UserWithoutPassword>> {
    const updatedUser = await this.userService.update(
      id,
      updateUserDto,
      activeUser,
    );
    if (!updatedUser) {
      throw new HttpException(
        'Erro ao atualizar usuário',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Busca os pets do usuário
    const pets = await this.petService.findByUserId(updatedUser.Id);

    return UserPresenter.toHateoas(updatedUser, pets);
  }

  @ApiDeleteUser()
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
