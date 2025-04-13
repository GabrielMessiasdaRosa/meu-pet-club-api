import { User } from '@/domain/entities/user.entity';
import { HateoasResource } from './hateoas-resource.presenter';

/**
 * Presenter para recurso de usuário único
 */
export class UserPresenter {
  static toHateoas(user: User): HateoasResource<User> {
    const userId = user.Id; // Usando o getter correto da entidade User
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

    return new HateoasResource(user, links);
  }

  /**
   * Converte o resultado para o usuário atual com links específicos
   */
  static toHateoasMe(user: User): HateoasResource<User> {
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

    return new HateoasResource(user, links);
  }

  /**
   * Converte uma lista de usuários para formato HATEOAS
   */
  static toHateoasList(users: User[]): HateoasResource<User[]> {
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

    return new HateoasResource(users, links);
  }
}
