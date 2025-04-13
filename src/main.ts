import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const SERVER_PORT = 3000;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.setGlobalPrefix('api/v1');
  const openApiConfig = new DocumentBuilder()
    .setTitle('meu-pet-club-api')
    .setDescription('meu-pet-club-api')
    .setVersion('0.1')

    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup('api/v1/docs', app, document);
  await app.listen(SERVER_PORT);
}
bootstrap();
