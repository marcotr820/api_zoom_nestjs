import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { ZoomWebhookService } from 'src/interoperabilidad/zoom/services/zoom-webhook.service';
import type { ZoomWebhookEventDto } from './dto/event-webhook.dto';

@Controller('webhook')
export class ZoomController {
  private readonly logger = new Logger(ZoomController.name);

  constructor(private readonly zoomWebhookService: ZoomWebhookService) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(@Body() body: ZoomWebhookEventDto) {
    if (!body) {
      this.logger.warn('Webhook recibido sin body');
      return { message: 'Body vacío' };
    }

    console.log(body.event, '-', body.payload.object.topic);
    

    return await this.zoomWebhookService.processEvent(body);
  }
}
