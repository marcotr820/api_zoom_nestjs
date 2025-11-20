import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ZoomWebhookService } from './services/zoom-webhook.service';
import { ZoomFileService } from './services/zoom-file.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ZoomWebhookService, ZoomFileService],
})
export class AppModule {}
