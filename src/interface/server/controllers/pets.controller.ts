import { CreatePetDto } from '@/application/dtos/pet/create-pet.dto';
import { UpdatePetDto } from '@/application/dtos/pet/update-pet.dto';
import { PetService } from '@/application/services/pet.service';
import { RoleEnum } from '@/common/enums/role.enum';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { PetPresenter, PetResponse } from '../presenters/pet.presenter';

@ApiBearerAuth()
@ApiTags('pets')
@Auth(AuthType.Private)
@Controller('pets')
export class PetsController {
  constructor(private readonly petService: PetService) {}

  @ApiOperation({
    summary: 'Listar todos os pets',
    description:
      'Retorna a lista completa de todos os pets cadastrados no sistema. Apenas administradores e ROOT podem ver todos os pets.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de pets recuperada com sucesso',
    type: HateoasResource,
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
  async findAll(): Promise<HateoasResource<PetResponse[]>> {
    const pets = await this.petService.findAll();
    return PetPresenter.toHateoasList(pets);
  }

  @ApiOperation({
    summary: 'Listar meus pets',
    description:
      'Retorna a lista de todos os pets associados ao usuário autenticado.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de pets do usuário recuperada com sucesso',
    type: HateoasResource,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Usuário não está autenticado',
  })
  @Get('my-pets')
  async findMyPets(
    @ActiveUser() user: ActiveUserData,
  ): Promise<HateoasResource<PetResponse[]>> {
    const pets = await this.petService.findByUserId(user.sub);
    return PetPresenter.toHateoasMyPets(pets, user.sub);
  }

  @ApiOperation({
    summary: 'Obter pet por ID',
    description:
      'Retorna os detalhes de um pet específico pelo seu ID. O usuário precisa ser dono do pet ou administrador.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do pet',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pet encontrado com sucesso',
    type: HateoasResource,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pet não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Usuário não está autenticado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Usuário não tem permissão para acessar este recurso',
  })
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData,
  ): Promise<HateoasResource<PetResponse>> {
    const pet = await this.petService.findById(id);

    if (!pet) {
      throw new HttpException('Pet não encontrado', HttpStatus.NOT_FOUND);
    }

    // Verifica se o usuário tem permissão para visualizar o pet
    if (
      pet.UserId !== user.sub &&
      user.role !== RoleEnum.ADMIN &&
      user.role !== RoleEnum.ROOT
    ) {
      throw new HttpException(
        'Você não tem permissão para visualizar este pet',
        HttpStatus.FORBIDDEN,
      );
    }

    return PetPresenter.toHateoas(pet);
  }

  @ApiOperation({
    summary: 'Criar um novo pet',
    description:
      'Cria um novo pet associado ao usuário autenticado. Apenas CLIENTES podem criar pets.',
  })
  @ApiBody({
    description: 'Dados para criação do pet',
    type: CreatePetDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pet criado com sucesso',
    type: HateoasResource,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Usuário não está autenticado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Apenas usuários do tipo CLIENTE podem criar pets',
  })
  @Roles(RoleEnum.USER)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPetDto: CreatePetDto,
    @ActiveUser() user: ActiveUserData,
  ): Promise<HateoasResource<PetResponse>> {
    const newPet = await this.petService.create(createPetDto, user);
    return PetPresenter.toHateoas(newPet);
  }

  @ApiOperation({
    summary: 'Atualizar pet por ID',
    description:
      'Atualiza os detalhes de um pet específico pelo seu ID. Apenas o dono do pet ou administradores podem atualizar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do pet',
    type: 'string',
  })
  @ApiBody({
    description: 'Dados para atualização do pet',
    type: UpdatePetDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pet atualizado com sucesso',
    type: HateoasResource,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pet não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Usuário não está autenticado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Você não tem permissão para atualizar este pet',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
    @ActiveUser() user: ActiveUserData,
  ): Promise<HateoasResource<PetResponse>> {
    const updatedPet = await this.petService.update(id, updatePetDto, user);
    return PetPresenter.toHateoas(updatedPet);
  }

  @ApiOperation({
    summary: 'Excluir pet por ID',
    description:
      'Remove permanentemente um pet do sistema pelo seu ID. Apenas o dono do pet ou administradores podem deletar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único do pet',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Pet excluído com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pet não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Usuário não está autenticado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Você não tem permissão para excluir este pet',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData,
  ): Promise<void> {
    await this.petService.delete(id, user);
  }
}
