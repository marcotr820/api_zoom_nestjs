import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { ZoomWebhookService } from './services/zoom-webhook.service';
import type { ZoomWebhookEventDto } from './interoperabilidad/zoom/dto/event-webhook.dto';

@Controller('webhook')
export class AppController {

  private readonly logger = new Logger(AppController.name);

  constructor(private readonly zoomWebhookService: ZoomWebhookService,){}

  @Post()
  @HttpCode(200)
  async handleWebhook(@Body() body: ZoomWebhookEventDto) {

    if (!body) {
      this.logger.warn('Webhook recibido sin body');
      return { message: 'Body vacío' };
    }

    /*if (body.payload.object.host_id === 'WDLZCfgCTke5vmWw5KtrUQ') {
      await this.zoomWebhookService.getCurrentMeet();
    }*/

    if (body.payload.object.host_id === 'WDLZCfgCTke5vmWw5KtrUQ') {
      return await this.zoomWebhookService.processEvent(body);
    }
    
    //await this.tokenService.getS2SToken();

    //return { status: 'ok' };
  }

}
