import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import type { MeetingStartedEvent, ZoomWebhookEvent } from './interfaces/miInterface.interface';
import { ZoomWebhookService } from './services/zoom-webhook.service';
import { ZoomTokenService } from './services/zoom-token.service';

@Controller('webhook')
export class AppController {

  private readonly logger = new Logger(AppController.name);

  constructor(private readonly zoomWebhookService: ZoomWebhookService,
    private readonly tokenService: ZoomTokenService
  ){}

  @Post()
  @HttpCode(200)
  async handleWebhook(@Body() body: ZoomWebhookEvent) {

    if (!body) {
      this.logger.warn('Webhook recibido sin body');
      return { message: 'Body vacío' };
    }

    /*if (body.payload.object.host_id === 'WDLZCfgCTke5vmWw5KtrUQ') {
      await this.zoomWebhookService.getCurrentMeet();
    }*/

    if (body.payload.object.host_id === 'WDLZCfgCTke5vmWw5KtrUQ') {
      console.log(body);
      return await this.zoomWebhookService.processEvent(body);
    }
    
    //await this.tokenService.getS2SToken();

    //return { status: 'ok' };
  }

}
