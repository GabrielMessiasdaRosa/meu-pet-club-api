import { CreatePetDto } from '@/application/dtos/pet/create-pet.dto';
import { UpdatePetDto } from '@/application/dtos/pet/update-pet.dto';
import { PetService } from '@/application/services/pet.service';
import {
  ApiCreatePet,
  ApiDeletePet,
  ApiGetPetById,
  ApiListAllPets,
  ApiListMyPets,
  ApiUpdatePet,
} from '@/common/decorators/swagger';
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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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

  @ApiListAllPets()
  @Roles(RoleEnum.ADMIN, RoleEnum.ROOT)
  @Get()
  async findAll(
    @ActiveUser() user: ActiveUserData,
  ): Promise<HateoasResource<PetResponse[]>> {
    const pets = await this.petService.findAll(user);
    return PetPresenter.toHateoasList(pets);
  }

  @ApiListMyPets()
  @Get('my-pets')
  async findMyPets(
    @ActiveUser() user: ActiveUserData,
  ): Promise<HateoasResource<PetResponse[]>> {
    const pets = await this.petService.findByUserId(user.sub);
    return PetPresenter.toHateoasMyPets(pets, user.sub);
  }

  @ApiGetPetById()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData,
  ): Promise<HateoasResource<PetResponse>> {
    const pet = await this.petService.findById(id, user);

    if (!pet) {
      throw new HttpException('Pet não encontrado', HttpStatus.NOT_FOUND);
    }

    return PetPresenter.toHateoas(pet);
  }

  @ApiCreatePet()
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

  @ApiUpdatePet()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
    @ActiveUser() user: ActiveUserData,
  ): Promise<HateoasResource<PetResponse>> {
    const updatedPet = await this.petService.update(id, updatePetDto, user);
    return PetPresenter.toHateoas(updatedPet);
  }

  @ApiDeletePet()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData,
  ): Promise<void> {
    await this.petService.delete(id, user);
  }
}
