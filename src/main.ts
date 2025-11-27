import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // <-- Necesario para que @Expose y @Type funcionen
      transformOptions: { excludeExtraneousValues: true },
    }),
  );
  await app.listen(process.env.APP_PORT ?? 3000); //TODO:M app_port
}
bootstrap();
