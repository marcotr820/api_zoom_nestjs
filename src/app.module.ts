import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ZoomWebhookService } from './services/zoom-webhook.service';
import { ZoomFileService } from './services/zoom-file.service';
import { ZoomTokenService } from './services/zoom-token.service';
import { JurisdiccionalModule } from './jurisdiccional/jurisdiccional.module';
import { InteroperabilidadModule } from './interoperabilidad/interoperabilidad.module';
import { typeOrmConfigAsync } from './infraestructure/database/config/typeorm.config';
import { configValidationSchema } from './infraestructure/environment/config.schema';
import { AudienciasDetallesModule } from './jurisdiccional/audiecias-detalles/audiencias-detalles.module';

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: [envFile], validationSchema: configValidationSchema }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    JurisdiccionalModule,
    InteroperabilidadModule,
    AudienciasDetallesModule,
  ],
  controllers: [AppController],
  providers: [AppService, ZoomWebhookService, ZoomFileService, ZoomTokenService],
})
export class AppModule {}
