import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { createHmac } from 'crypto';

// DTO para el body del webhook
interface ZoomWebhookPayload {
  plainToken?: string;
  object?: any; // Puedes tipar según eventos que recibas
}

interface ZoomWebhookBody {
  event: string;
  event_ts: number;
  payload: ZoomWebhookPayload;
}

@Controller('webhook')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @Post()
  @HttpCode(200) //siempre debe devolver 200 esta en la documentacion de zoom para la validacion de la url
  handleWebhook(@Body() body: ZoomWebhookBody) {
    if (!body) {
      this.logger.warn('Webhook recibido sin body');
      return { message: 'Body vacío' };
    }

    const zoomSecret = process.env.ZOOM_SECRET_TOKEN ?? '';

    console.log(body);

    // Validación de la firma (opcional pero recomendada)
    // Si quieres validar x-zm-signature, necesitas usar @Req() o un middleware
    // Aquí asumimos que lo estás recibiendo correctamente

    // Validación del challenge
    if (body.event === 'endpoint.url_validation' && body.payload.plainToken) {
      const plainToken = body.payload.plainToken;
      const encryptedToken = createHmac('sha256', zoomSecret)
        .update(plainToken)
        .digest('hex');

      this.logger.log('Respondiento challenge a Zoom', {
        plainToken,
        encryptedToken,
      });

      return {
        plainToken,
        encryptedToken,
      };
    }

    // Manejo de eventos normales
    this.logger.log('Evento autorizado de Zoom', body.event);

    // Aquí podrías manejar otros eventos como recording.started, recording.completed, etc.
    // Ejemplo:
    if (body.event === 'recording.started') {
      this.logger.log('Grabación iniciada', body.payload);
    }
    if (body.event === 'recording.completed') {
      this.logger.log('Grabación completada', body.payload);
      // Aquí podrías llamar a tu servicio para descargar el video
    }

    return { status: 'ok' };
  }
}
