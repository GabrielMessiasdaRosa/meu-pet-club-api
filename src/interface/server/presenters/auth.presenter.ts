import { User } from '@/domain/entities/user.entity';
import { HateoasResource } from './hateoas-resource.presenter';

// Interface para representar o usuário autenticado sem a senha
export type AuthUserData = {
  id: string;
  name: string;
  email: string;
  role: string;
};

// Interface para representar a resposta de login
export type SignInResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUserData;
};

// Interface para representar a resposta para operações de autenticação simples
export type AuthMessageResponse = {
  message: string;
};

/**
 * Presenter para recursos de autenticação
 */
export class AuthPresenter {
  /**
   * Formata a resposta de login com links HATEOAS
   */
  static toHateoasSignIn(signInData: {
    accessToken: string;
    refreshToken: string;
    user: User;
  }): HateoasResource<SignInResponse> {
    // Remove a senha do usuário antes de enviar na resposta
    const userData: AuthUserData = {
      id: signInData.user.Id,
      name: signInData.user.Name,
      email: signInData.user.Email,
      role: signInData.user.Role,
    };

    // Cria a resposta formatada
    const responseData: SignInResponse = {
      accessToken: signInData.accessToken,
      refreshToken: signInData.refreshToken,
      user: userData,
    };

    // Links relacionados à autenticação
    const links = [
      {
        href: '/auth/refresh-tokens',
        rel: 'refresh',
        method: 'POST',
      },
      {
        href: '/auth/signout',
        rel: 'signout',
        method: 'POST',
      },
      {
        href: '/users/me',
        rel: 'profile',
        method: 'GET',
      },
    ];

    return new HateoasResource(responseData, links);
  }

  /**
   * Formata a resposta de registro com links HATEOAS
   */
  static toHateoasSignUp(
    message: string,
  ): HateoasResource<AuthMessageResponse> {
    const responseData: AuthMessageResponse = {
      message,
    };

    const links = [
      {
        href: '/auth/signin',
        rel: 'signin',
        method: 'POST',
      },
    ];

    return new HateoasResource(responseData, links);
  }

  /**
   * Formata a resposta de renovação de tokens com links HATEOAS
   */
  static toHateoasRefreshTokens(tokenData: {
    accessToken: string;
    refreshToken: string;
    user: User;
  }): HateoasResource<SignInResponse> {
    // Remove a senha do usuário antes de enviar na resposta
    const userData: AuthUserData = {
      id: tokenData.user.Id,
      name: tokenData.user.Name,
      email: tokenData.user.Email,
      role: tokenData.user.Role,
    };

    // Cria a resposta formatada
    const responseData: SignInResponse = {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      user: userData,
    };

    const links = [
      {
        href: '/auth/signout',
        rel: 'signout',
        method: 'POST',
      },
      {
        href: '/users/me',
        rel: 'profile',
        method: 'GET',
      },
    ];

    return new HateoasResource(responseData, links);
  }

  /**
   * Formata a resposta de solicitação de redefinição de senha com links HATEOAS
   */
  static toHateoasPasswordResetRequest(
    message: string,
  ): HateoasResource<AuthMessageResponse> {
    const responseData: AuthMessageResponse = {
      message,
    };

    const links = [
      {
        href: '/auth/reset-password',
        rel: 'reset-password',
        method: 'POST',
      },
      {
        href: '/auth/signin',
        rel: 'signin',
        method: 'POST',
      },
    ];

    return new HateoasResource(responseData, links);
  }

  /**
   * Formata a resposta de redefinição de senha com links HATEOAS
   */
  static toHateoasPasswordReset(
    message: string,
  ): HateoasResource<AuthMessageResponse> {
    const responseData: AuthMessageResponse = {
      message,
    };

    const links = [
      {
        href: '/auth/signin',
        rel: 'signin',
        method: 'POST',
      },
    ];

    return new HateoasResource(responseData, links);
  }

  /**
   * Formata a resposta de logout com links HATEOAS
   */
  static toHateoasSignOut(): HateoasResource<AuthMessageResponse> {
    const responseData: AuthMessageResponse = {
      message: 'Sessão encerrada com sucesso',
    };

    const links = [
      {
        href: '/auth/signin',
        rel: 'signin',
        method: 'POST',
      },
    ];

    return new HateoasResource(responseData, links);
  }
}
