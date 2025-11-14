import { Controller, Post, Req, Header, type RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { createHmac } from 'crypto';

@Controller('webhook')
export class AppController {
  @Post()
  @Header('Content-Type', 'application/json')
  handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const body = JSON.parse((req.rawBody ?? '').toString());
    const zoomSecret = process.env.ZOOM_SECRET_TOKEN ?? '';

    if (body.event === 'endpoint.url_validation') {
      const encryptedToken = createHmac('sha256', zoomSecret)
        .update(body.payload.plainToken)
        .digest('hex');

      return {
        plainToken: body.payload.plainToken,
        encryptedToken,
      };
    }

    return { status: 'ok' };
  }
}
