import { Body, Controller, Get, Logger, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { createHmac } from 'crypto';

interface ZoomWebhookPayload {
  plainToken: string;
  encryptedToken?: string;
  object?: any;
}

interface ZoomWebhookBody {
  event: string;
  event_ts: number;
  payload: ZoomWebhookPayload;
}

@Controller('webhook')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @Get()
  test() {
    return 'hola mundo';
  }

  @Post()
  handleWebhook(@Body() body: ZoomWebhookBody, @Res() res: Response) {
    if (!body) {
      this.logger.warn('Webhook recibido sin body');
      return res.json({ message: 'Body vacío' });
    }

    const zoomSecret = process.env.ZOOM_SECRET_TOKEN ?? '';

    console.log('BODY RECIBIDO ===>', body);
    console.log('ZOOM SECRET ===>', zoomSecret);

    // 🔹 Validación del endpoint
    if (body.event === 'endpoint.url_validation') {
      const plainToken = body.payload.plainToken;

      const encryptedToken = createHmac('sha256', zoomSecret)
        .update(plainToken)
        .digest('base64');  // <-- OBLIGATORIO base64

      console.log('Enviando respuesta de validación:', {
        plainToken,
        encryptedToken,
      });

      // 🔹 Respuesta EXACTA para Zoom
      return res.json({
        plainToken,
        encryptedToken,
      });
    }

    // 🔹 Otros eventos
    this.logger.log('Evento recibido:', body.event);

    return res.json({ status: 'ok' });
  }
}
