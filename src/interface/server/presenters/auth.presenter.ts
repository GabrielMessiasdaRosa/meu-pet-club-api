import { User } from '@/domain/entities/user.entity';
import { HateoasLink, HateoasResource } from './hateoas-resource.presenter';

/**
 * Interface para representar a resposta de uma mensagem de autenticação
 */
export interface AuthMessageResponse {
  message: string;
}

/**
 * Interface para representar a resposta de login
 */
export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

/**
 * Classe responsável por criar respostas HATEOAS para operações de autenticação
 */
export class AuthPresenter {
  /**
   * Cria uma resposta HATEOAS para o cadastro de usuário
   */
  static toHateoasSignUp(
    message: string,
  ): HateoasResource<AuthMessageResponse> {
    const links: HateoasLink[] = [
      {
        rel: 'self',
        href: '/api/v1/auth/signup',
        method: 'POST',
      },
      {
        rel: 'sign-in',
        href: '/api/v1/auth/signin',
        method: 'POST',
      },
    ];

    return new HateoasResource<AuthMessageResponse>({ message }, links);
  }

  /**
   * Cria uma resposta HATEOAS para o reset de senha
   */
  static toHateoasPasswordReset(
    message: string,
  ): HateoasResource<AuthMessageResponse> {
    const links: HateoasLink[] = [
      {
        rel: 'self',
        href: '/api/v1/auth/reset-password',
        method: 'POST',
      },
      {
        rel: 'sign-in',
        href: '/api/v1/auth/signin',
        method: 'POST',
      },
    ];

    return new HateoasResource<AuthMessageResponse>({ message }, links);
  }

  /**
   * Cria uma resposta HATEOAS para a solicitação de reset de senha
   */
  static toHateoasPasswordResetRequest(
    message: string,
  ): HateoasResource<AuthMessageResponse> {
    const links: HateoasLink[] = [
      {
        rel: 'self',
        href: '/api/v1/auth/request-password-reset',
        method: 'POST',
      },
      {
        rel: 'reset-password',
        href: '/api/v1/auth/reset-password',
        method: 'POST',
      },
    ];

    return new HateoasResource<AuthMessageResponse>({ message }, links);
  }

  /**
   * Cria uma resposta HATEOAS para o login
   */
  static toHateoasSignIn(authResult: {
    accessToken: string;
    refreshToken: string;
    user: User;
  }): HateoasResource<SignInResponse> {
    const links: HateoasLink[] = [
      {
        rel: 'self',
        href: '/api/v1/auth/signin',
        method: 'POST',
      },
      {
        rel: 'refresh',
        href: '/api/v1/auth/refresh-tokens',
        method: 'POST',
      },
      {
        rel: 'sign-out',
        href: '/api/v1/auth/signout',
        method: 'POST',
      },
    ];

    const response: SignInResponse = {
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      user: {
        id: authResult.user.Id,
        email: authResult.user.Email,
        name: authResult.user.Name,
        role: authResult.user.Role,
      },
    };

    return new HateoasResource<SignInResponse>(response, links);
  }

  /**
   * Cria uma resposta HATEOAS para o refresh de tokens
   */
  static toHateoasRefreshTokens(authResult: {
    accessToken: string;
    refreshToken: string;
    user: User;
  }): HateoasResource<SignInResponse> {
    const links: HateoasLink[] = [
      {
        rel: 'self',
        href: '/api/v1/auth/refresh-tokens',
        method: 'POST',
      },
      {
        rel: 'sign-in',
        href: '/api/v1/auth/signin',
        method: 'POST',
      },
      {
        rel: 'sign-out',
        href: '/api/v1/auth/signout',
        method: 'POST',
      },
    ];

    const response: SignInResponse = {
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      user: {
        id: authResult.user.Id,
        email: authResult.user.Email,
        name: authResult.user.Name,
        role: authResult.user.Role,
      },
    };

    return new HateoasResource<SignInResponse>(response, links);
  }

  /**
   * Cria uma resposta HATEOAS para o logout
   */
  static toHateoasSignOut(): HateoasResource<AuthMessageResponse> {
    const links: HateoasLink[] = [
      {
        rel: 'self',
        href: '/api/v1/auth/signout',
        method: 'POST',
      },
      {
        rel: 'sign-in',
        href: '/api/v1/auth/signin',
        method: 'POST',
      },
    ];

    return new HateoasResource<AuthMessageResponse>(
      { message: 'Sessão encerrada com sucesso' },
      links,
    );
  }
}
