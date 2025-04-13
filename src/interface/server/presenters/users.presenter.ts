import { User } from '@/domain/entities/user.entity';
import { HateoasResource } from './hateoas-resource.presenter';

// Interface para representar o usuário sem a senha
export type UserWithoutPassword = {
  id: string;
  name: string;
  email: string;
  role: string;
  resetToken?: string;
  resetTokenExpires?: Date;
};

/**
 * Presenter para recurso de usuário único
 */
export class UserPresenter {
  static toHateoas(user: User): HateoasResource<UserWithoutPassword> {
    // Cria uma cópia do usuário sem a senha
    const userWithoutPassword: UserWithoutPassword = {
      id: user.Id,
      name: user.Name,
      email: user.Email,
      role: user.Role,
      resetToken: user.ResetToken,
      resetTokenExpires: user.ResetTokenExpires,
    };

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

    return new HateoasResource(userWithoutPassword, links);
  }

  /**
   * Converte o resultado para o usuário atual com links específicos
   */
  static toHateoasMe(user: User): HateoasResource<UserWithoutPassword> {
    // Cria uma cópia do usuário sem a senha
    const userWithoutPassword: UserWithoutPassword = {
      id: user.Id,
      name: user.Name,
      email: user.Email,
      role: user.Role,
      resetToken: user.ResetToken,
      resetTokenExpires: user.ResetTokenExpires,
    };

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

    return new HateoasResource(userWithoutPassword, links);
  }

  /**
   * Converte uma lista de usuários para formato HATEOAS
   */
  static toHateoasList(users: User[]): HateoasResource<UserWithoutPassword[]> {
    // Remove a senha de todos os usuários na lista
    const usersWithoutPassword: UserWithoutPassword[] = users.map((user) => ({
      id: user.Id,
      name: user.Name,
      email: user.Email,
      role: user.Role,
      resetToken: user.ResetToken,
      resetTokenExpires: user.ResetTokenExpires,
    }));

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
