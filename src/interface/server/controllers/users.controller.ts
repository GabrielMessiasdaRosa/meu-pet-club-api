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
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Listar todos os usuários',
    description:
      'Retorna a lista completa de todos os usuários cadastrados no sistema',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de usuários recuperada com sucesso',
    type: HateoasResource,
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              id: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440000',
              },
              name: { type: 'string', example: 'João Silva' },
              email: { type: 'string', example: 'joao.silva@exemplo.com' },
              role: {
                type: 'string',
                enum: ['USER', 'ADMIN', 'ROOT'],
                example: 'USER',
              },
            },
          },
        },
        links: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              href: { type: 'string' },
              rel: { type: 'string' },
              method: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Usuário não está autenticado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Usuário não tem permissão para acessar este recurso',
  })
  @Roles(RoleEnum.ADMIN, RoleEnum.ROOT)
  @Get()
  async findAll(): Promise<HateoasResource<UserWithoutPassword[]>> {
    const users = await this.userService.findAll();
    return UserPresenter.toHateoasList(users);
  }

  @ApiOperation({
    summary: 'Obter dados do usuário atual',
    description: 'Retorna os dados do usuário autenticado',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dados do usuário recuperados com sucesso',
    type: HateoasResource,
    schema: {
      properties: {
        data: {
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            name: { type: 'string', example: 'João Silva' },
            email: { type: 'string', example: 'joao.silva@exemplo.com' },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN', 'ROOT'],
              example: 'USER',
            },
          },
        },
        links: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              href: { type: 'string' },
              rel: { type: 'string' },
              method: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Usuário não está autenticado',
  })
  @Get('me')
  async findMe(
    @ActiveUser() user: ActiveUserData,
  ): Promise<HateoasResource<UserWithoutPassword>> {
    const userData = await this.userService.findMe(user.sub);
    if (!userData) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }
    return UserPresenter.toHateoasMe(userData);
  }

  @ApiOperation({
    summary: 'Atualizar dados do usuário atual',
    description: 'Permite ao usuário autenticado atualizar seus próprios dados',
  })
  @ApiBody({
    description: 'Dados para atualização do usuário',
    schema: {
      properties: {
        name: { type: 'string', example: 'João da Silva' },
        email: { type: 'string', example: 'joao.novo@exemplo.com' },
        password: { type: 'string', example: 'novaSenha123' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuário atualizado com sucesso',
    type: HateoasResource,
    schema: {
      properties: {
        data: {
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            name: { type: 'string', example: 'João da Silva' },
            email: { type: 'string', example: 'joao.novo@exemplo.com' },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN', 'ROOT'],
              example: 'USER',
            },
          },
        },
        links: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              href: { type: 'string' },
              rel: { type: 'string' },
              method: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos para atualização',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Usuário não está autenticado',
  })
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
    return UserPresenter.toHateoasMe(updatedUser);
  }

  @ApiOperation({
    summary: 'Criar novo usuário',
    description: 'Cria um novo usuário no sistema (apenas ADMIN e ROOT)',
  })
  @ApiBody({
    description: 'Dados para criação de usuário',
    type: CreateUserDto,
    schema: {
      properties: {
        name: { type: 'string', example: 'Maria Santos' },
        email: {
          type: 'string',
          format: 'email',
          example: 'maria@exemplo.com',
        },
        password: { type: 'string', format: 'password', example: 'Senha123!' },
        role: {
          type: 'string',
          enum: ['USER', 'ADMIN', 'ROOT'],
          example: 'USER',
        },
      },
      required: ['name', 'email', 'password', 'role'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuário criado com sucesso',
    type: HateoasResource,
    schema: {
      properties: {
        data: {
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            name: { type: 'string', example: 'Maria Santos' },
            email: { type: 'string', example: 'maria@exemplo.com' },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN', 'ROOT'],
              example: 'USER',
            },
          },
        },
        links: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              href: { type: 'string' },
              rel: { type: 'string' },
              method: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos para criação de usuário',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email já está em uso',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Usuário não está autenticado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Usuário não tem permissão para criar outros usuários',
  })
  @Roles(RoleEnum.ADMIN, RoleEnum.ROOT)
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<HateoasResource<UserWithoutPassword>> {
    const newUser = await this.userService.create(createUserDto);
    return UserPresenter.toHateoas(newUser);
  }

  @ApiOperation({
    summary: 'Buscar usuário por ID',
    description:
      'Retorna os dados de um usuário específico pelo seu ID (apenas ADMIN e ROOT)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do usuário',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuário encontrado com sucesso',
    type: HateoasResource,
    schema: {
      properties: {
        data: {
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            name: { type: 'string', example: 'João Silva' },
            email: { type: 'string', example: 'joao.silva@exemplo.com' },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN', 'ROOT'],
              example: 'USER',
            },
          },
        },
        links: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              href: { type: 'string' },
              rel: { type: 'string' },
              method: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID inválido ou não fornecido',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Usuário não está autenticado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Usuário não tem permissão para acessar este recurso',
  })
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
    return UserPresenter.toHateoas(user);
  }

  @ApiOperation({
    summary: 'Atualizar usuário por ID',
    description:
      'Atualiza os dados de um usuário específico pelo seu ID (apenas ADMIN e ROOT)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do usuário',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    description: 'Dados para atualização do usuário',
    type: UpdateUserDto,
    schema: {
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        name: { type: 'string', example: 'José Silva Atualizado' },
        email: { type: 'string', example: 'jose.novo@exemplo.com' },
        password: { type: 'string', example: 'novaSenha123' },
      },
      required: ['id'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuário atualizado com sucesso',
    type: HateoasResource,
    schema: {
      properties: {
        data: {
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            name: { type: 'string', example: 'José Silva Atualizado' },
            email: { type: 'string', example: 'jose.novo@exemplo.com' },
            role: {
              type: 'string',
              enum: ['USER', 'ADMIN', 'ROOT'],
              example: 'USER',
            },
          },
        },
        links: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              href: { type: 'string' },
              rel: { type: 'string' },
              method: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos para atualização',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Usuário não está autenticado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Usuário não tem permissão para atualizar este usuário',
  })
  @Roles(RoleEnum.ADMIN, RoleEnum.ROOT)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<HateoasResource<UserWithoutPassword>> {
    const updatedUser = await this.userService.update(id, updateUserDto);
    if (!updatedUser) {
      throw new HttpException(
        'Erro ao atualizar usuário',
        HttpStatus.BAD_REQUEST,
      );
    }
    return UserPresenter.toHateoas(updatedUser);
  }

  @ApiOperation({
    summary: 'Excluir usuário por ID',
    description:
      'Remove permanentemente um usuário do sistema pelo seu ID (apenas ADMIN e ROOT)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do usuário',
    type: 'string',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuário excluído com sucesso',
    schema: {
      properties: {
        message: {
          type: 'string',
          example:
            'Usuário com ID 550e8400-e29b-41d4-a716-446655440000 foi excluído com sucesso',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Usuário não está autenticado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Usuário não tem permissão para excluir este usuário',
  })
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
