import { Pet } from '@/domain/entities/pet.entity';
import { User } from '@/domain/entities/user.entity';
import { HateoasResource } from './hateoas-resource.presenter';
import { PetResponse } from './pet.presenter';

// Interface para representar o usuário sem a senha
export type UserWithoutPassword = {
  id: string;
  name: string;
  email: string;
  role: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  pets?: PetResponse[];
};

/**
 * Presenter para recurso de usuário único
 */
export class UserPresenter {
  static toHateoas(
    user: User,
    pets?: Pet[],
  ): HateoasResource<UserWithoutPassword> {
    // Cria uma cópia do usuário sem a senha
    const userWithoutPassword: UserWithoutPassword = {
      id: user.Id,
      name: user.Name,
      email: user.Email,
      role: user.Role,
      resetToken: user.ResetToken,
      resetTokenExpires: user.ResetTokenExpires,
    };

    // Adiciona os pets se existirem
    if (pets && pets.length > 0) {
      userWithoutPassword.pets = pets.map((pet) => ({
        id: pet.Id,
        name: pet.Name,
        type: pet.Type,
        breed: pet.Breed,
        age: pet.Age,
        userId: pet.UserId,
      }));
    }

    const userId = user.Id;
    const links = [
      {
        href: `/users/${userId}`,
        rel: 'self',
        method: 'GET',
      },
      {
        href: `/users/${userId}`,
        rel: 'update',
        method: 'PATCH',
      },
      {
        href: `/users/${userId}`,
        rel: 'delete',
        method: 'DELETE',
      },
    ];

    // Adiciona links para os pets caso existam
    if (pets && pets.length > 0) {
      links.push({
        href: `/pets/my-pets`,
        rel: 'pets',
        method: 'GET',
      });
    }

    return new HateoasResource(userWithoutPassword, links);
  }

  /**
   * Converte o resultado para o usuário atual com links específicos
   */
  static toHateoasMe(
    user: User,
    pets?: Pet[],
  ): HateoasResource<UserWithoutPassword> {
    // Cria uma cópia do usuário sem a senha
    const userWithoutPassword: UserWithoutPassword = {
      id: user.Id,
      name: user.Name,
      email: user.Email,
      role: user.Role,
      resetToken: user.ResetToken,
      resetTokenExpires: user.ResetTokenExpires,
    };

    // Adiciona os pets se existirem
    if (pets && pets.length > 0) {
      userWithoutPassword.pets = pets.map((pet) => ({
        id: pet.Id,
        name: pet.Name,
        type: pet.Type,
        breed: pet.Breed,
        age: pet.Age,
        userId: pet.UserId,
      }));
    }

    const links = [
      {
        href: '/users/me',
        rel: 'self',
        method: 'GET',
      },
      {
        href: '/users/me',
        rel: 'update',
        method: 'PATCH',
      },
    ];

    // Adiciona links para os pets caso existam
    if (pets && pets.length > 0) {
      links.push({
        href: `/pets/my-pets`,
        rel: 'pets',
        method: 'GET',
      });
    }

    return new HateoasResource(userWithoutPassword, links);
  }

  /**
   * Converte uma lista de usuários para formato HATEOAS
   */
  static toHateoasList(
    users: User[],
    usersPets?: Map<string, Pet[]>,
  ): HateoasResource<UserWithoutPassword[]> {
    // Remove a senha de todos os usuários na lista
    const usersWithoutPassword: UserWithoutPassword[] = users.map((user) => {
      const userDto: UserWithoutPassword = {
        id: user.Id,
        name: user.Name,
        email: user.Email,
        role: user.Role,
        resetToken: user.ResetToken,
        resetTokenExpires: user.ResetTokenExpires,
      };

      // Adiciona os pets do usuário se disponíveis
      if (usersPets && usersPets.has(user.Id)) {
        const pets = usersPets.get(user.Id);
        if (pets && pets.length > 0) {
          userDto.pets = pets.map((pet) => ({
            id: pet.Id,
            name: pet.Name,
            type: pet.Type,
            breed: pet.Breed,
            age: pet.Age,
            userId: pet.UserId,
          }));
        }
      }

      return userDto;
    });

    const links = [
      {
        href: '/users',
        rel: 'self',
        method: 'GET',
      },
      {
        href: '/users',
        rel: 'create',
        method: 'POST',
      },
    ];

    return new HateoasResource(usersWithoutPassword, links);
  }
}
