import { RoleEnum } from '@/common/enums/role.enum';
import { User } from '@/domain/entities/user.entity';
import { MongooseUserRepository } from '@/infra/database/mongodb/repositories/user.repository';
import { EmailService } from '@/infra/email/email.service';
import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { v4 as uuid } from 'uuid';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { UpdateMeDto } from '../dtos/user/update-me.dto';
import { UpdateUserDto } from '../dtos/user/update-user.dto';
import { PetService } from './pet.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject('UserRepository')
    private readonly userRepository: MongooseUserRepository,
    @Inject(PetService)
    private readonly petService: PetService,
    private readonly emailService: EmailService,
  ) {}

  async findAll() {
    return await this.userRepository.findAll();
  }

  async findById(id: string) {
    return await this.userRepository.findById(id);
  }

  async findByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  async create(userData: CreateUserDto, currentUser: ActiveUserData) {
    // Verifica se está tentando criar um usuário ROOT
    if (userData.role === RoleEnum.ROOT) {
      // Se o usuário atual não for ROOT, não permite
      if (currentUser.role !== RoleEnum.ROOT) {
        throw new ForbiddenException(
          'Apenas usuários ROOT podem criar outros usuários ROOT',
        );
      }
    }

    // Verifica se é um ADMIN tentando criar um usuário USER
    if (
      currentUser.role === RoleEnum.ADMIN &&
      userData.role === RoleEnum.USER
    ) {
      throw new ForbiddenException(
        'Usuários ADMIN não podem criar usuários do tipo USER',
      );
    }

    // ADMIN só pode criar outros ADMIN, ROOT pode criar qualquer tipo
    const newUser = new User({
      id: uuid(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
    });

    const createdUser = await this.userRepository.create(newUser);

    // Enviar credenciais por e-mail apenas se o usuário criador for ADMIN ou ROOT
    if (
      currentUser.role === RoleEnum.ADMIN ||
      currentUser.role === RoleEnum.ROOT
    ) {
      try {
        await this.emailService.sendUserCredentials(
          createdUser.Email,
          createdUser.Name,
          userData.password, // Usando a senha não criptografada para envio por e-mail
        );
        this.logger.log(
          `Credenciais enviadas com sucesso para o usuário: ${createdUser.Email}`,
        );
      } catch (error) {
        this.logger.error(
          `Erro ao enviar credenciais para o usuário: ${createdUser.Email}`,
          error,
        );
        // Não interrompe o fluxo se o envio de email falhar
      }
    }

    return createdUser;
  }

  async update(
    id: string,
    userData: UpdateUserDto | UpdateMeDto,
    currentUser?: ActiveUserData,
  ) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Se temos um usuário autenticado e não é uma atualização do próprio usuário
    if (currentUser && currentUser.sub !== id) {
      // Verifica se é um ADMIN tentando atualizar um USER
      if (currentUser.role === RoleEnum.ADMIN && user.Role === RoleEnum.USER) {
        throw new ForbiddenException(
          'Usuários ADMIN não podem atualizar usuários do tipo USER',
        );
      }
    }

    const existingUser = new User({
      id: user.Id,
      name: user.Name,
      email: user.Email,
      password: user.Password,
      role: user.Role,
    });

    existingUser.setName(userData.name ?? existingUser.Name);
    existingUser.setEmail(userData.email ?? existingUser.Email);
    existingUser.setPassword(userData.password ?? existingUser.Password);

    return await this.userRepository.update(id, existingUser);
  }

  async findMe(id: string) {
    return await this.userRepository.findById(id);
  }

  async delete(id: string) {
    return await this.userRepository.delete(id);
  }

  async findUserWithPets(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }

    const pets = await this.petService.findByUserId(user.Id);
    return { user, pets };
  }
}
