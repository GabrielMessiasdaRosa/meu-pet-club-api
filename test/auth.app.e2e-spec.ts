import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { RoleEnum } from '../src/common/enums/role.enum';

describe('Autenticação (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  beforeAll(async () => {
    // Configurar MongoDB em memória para testes
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        MongooseModule.forRootAsync({
          useFactory: () => ({
            uri,
          }),
        }),
      ],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          switch (key) {
            case 'JWT_SECRET':
              return 'test-jwt-secret';
            case 'JWT_TOKEN_AUDIENCE':
              return 'test-audience';
            case 'JWT_TOKEN_ISSUER':
              return 'test-issuer';
            case 'JWT_ACCESS_TOKEN_TTL':
              return '3600';
            case 'JWT_REFRESH_TOKEN_TTL':
              return '86400';
            default:
              return process.env[key];
          }
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  const testUser = {
    email: 'teste@meupetclub.com.br',
    password: 'Senha@123',
    name: 'Usuário de Teste',
    role: RoleEnum.USER,
  };

  const adminUser = {
    email: 'admin@meupetclub.com.br',
    password: 'Senha@123',
    name: 'Administrador',
    role: RoleEnum.ADMIN,
  };

  describe('Registro e Login', () => {
    it('/auth/signup (POST) - deve criar um novo usuário', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty(
            'message',
            'User created successfully',
          );
        });
    });

    it('/auth/signup (POST) - deve impedir criação de usuário com email já existente', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(testUser)
        .expect(409);
    });

    it('/auth/signin (POST) - deve autenticar um usuário válido', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('Id');
      expect(response.body.data.user).toHaveProperty('Email', testUser.email);
      expect(response.body.data.user).toHaveProperty('Name', testUser.name);
      expect(response.body.data.user).toHaveProperty('Role', testUser.role);

      // Guardar tokens e userId para testes futuros
      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
      userId = response.body.data.user.Id;
    });

    it('/auth/signin (POST) - deve recusar autenticação com credenciais inválidas', () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: testUser.email,
          password: 'senha_incorreta',
        })
        .expect(401);
    });
  });

  describe('Gerenciamento de Tokens', () => {
    it('/auth/refresh-tokens (POST) - deve renovar tokens com refresh token válido', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh-tokens')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          refreshToken: refreshToken,
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('user');

      // Atualizar tokens
      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });

    it('/auth/refresh-tokens (POST) - deve recusar renovação sem token de acesso', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh-tokens')
        .send({
          refreshToken: refreshToken,
        })
        .expect(401);
    });

    it('/auth/signout (POST) - deve invalidar o token de acesso do usuário', () => {
      return request(app.getHttpServer())
        .post('/auth/signout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('message');
        });
    });

    it('/auth/signout (POST) - token invalidado não deve ser mais aceito', () => {
      return request(app.getHttpServer())
        .post('/auth/signout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });
  });

  describe('Recuperação de Senha', () => {
    it('/auth/request-password-reset (POST) - deve solicitar recuperação de senha', () => {
      return request(app.getHttpServer())
        .post('/auth/request-password-reset')
        .send({
          email: testUser.email,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty(
            'message',
            'Email de recuperação de senha enviado.',
          );
        });
    });

    // Nota: Não podemos testar completamente o reset de senha em testes e2e
    // pois precisaríamos ter acesso ao token gerado e enviado por email
    it('/auth/request-password-reset (POST) - deve retornar erro para email não existente', () => {
      return request(app.getHttpServer())
        .post('/auth/request-password-reset')
        .send({
          email: 'naoexiste@exemplo.com',
        })
        .expect(401);
    });
  });

  describe('Gestão de Usuários com Diferentes Perfis', () => {
    it('deve criar um usuário administrador', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(adminUser)
        .expect(201);
    });

    it('deve autenticar o administrador', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: adminUser.email,
          password: adminUser.password,
        })
        .expect(200);

      // Guardar token de admin para testes de permissões
      accessToken = response.body.data.accessToken;
    });

    it('deve impedir que ADMIN crie um usuário comum', () => {
      const newUser = {
        email: 'usuario2@meupetclub.com.br',
        password: 'Senha@123',
        name: 'Usuário 2',
        role: RoleEnum.USER,
      };

      return request(app.getHttpServer())
        .post('/auth/signup')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(newUser)
        .expect(403);
    });
  });
});
