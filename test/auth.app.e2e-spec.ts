import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import * as request from 'supertest';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Sign up and sign in to get tokens
    await request(app.getHttpServer()).post('/auth/signup').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'USER',
    });

    const signInResponse = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    accessToken = signInResponse.body.accessToken;
    refreshToken = signInResponse.body.refreshToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/refresh-tokens (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh-tokens')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        refreshToken,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');

    // Atualiza o accessToken global com o novo recebido pelo refresh
    accessToken = response.body.accessToken;
    if (response.body.refreshToken) {
      refreshToken = response.body.refreshToken;
    }
  });

  it('/auth/signout (POST)', async () => {
    // Usa o accessToken atualizado do teste anterior
    const response = await request(app.getHttpServer())
      .post('/auth/signout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });
});
