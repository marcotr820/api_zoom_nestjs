import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import type { ZoomWebhookEvent } from './interfaces/miInterface.interface';
import { ZoomWebhookService } from './services/zoom-webhook.service';

@Controller('webhook')
export class AppController {

  private readonly logger = new Logger(AppController.name);

  constructor(private readonly zoomWebhookService: ZoomWebhookService){}

  @Post()
  @HttpCode(200)
  async handleWebhook(@Body() body: ZoomWebhookEvent) {

    if (!body) {
      this.logger.warn('Webhook recibido sin body');
      return { message: 'Body vacío' };
    }

    return await this.zoomWebhookService.processEvent(body);

    //return { status: 'ok' };
  }

}
