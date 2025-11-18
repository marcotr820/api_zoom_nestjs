import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import axios from 'axios';
import { createHmac } from 'crypto';
import { AppService } from './app.service';

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

interface DataToken {
  access_token: string;
  expires_in: number;
}

@Controller('webhook')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  private readonly accountId = 'yLRyFG5dRZiJL2Ahq1_oQw';
  private readonly clientId = 'xm9szqwuS62igiRCRJRlwA';
  private readonly clientSecret = 'LdEcfOwF8rUJ4auED3Lb1YW8MgFaiTVk';
  private readonly zoomSecret = 'gKVugeySTR2zuQXea80xlg';

  private dataToken: DataToken | undefined = undefined;

  constructor(private readonly appService: AppService){}

  @Post()
  @HttpCode(200)
  async handleWebhook(@Body() body: ZoomWebhookBody) {

    if (!body) {
      this.logger.warn('Webhook recibido sin body');
      return { message: 'Body vacío' };
    }

    //console.log(body);

    // Validación de la firma (opcional pero recomendada)
    // Si quieres validar x-zm-signature, necesitas usar @Req() o un middleware
    // Aquí asumimos que lo estás recibiendo correctamente

    // Validación del challenge
    if (body.event === 'endpoint.url_validation' && body.payload.plainToken) {
      const plainToken = body.payload.plainToken;
      const encryptedToken = createHmac('sha256', this.zoomSecret)
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
    if (body.event === 'meeting.started') {
      this.logger.log('Reunion Iniciada');
      await this.getAccessToken();
    }
    if (body.event === 'recording.started') {
      this.logger.log('Grabación iniciada', body.payload);
    }
    if (body.event === 'recording.completed') {
      this.logger.log('Grabación completada', body.payload);
      if (body.payload.object.host_id === 'WDLZCfgCTke5vmWw5KtrUQ') {
        console.log('evento de marcoa')
      }
      /*if (!this.dataToken || Date.now() > this.dataToken.expires_in) {
        await this.getAccessToken();
      }*/
      //await this.appService.handleRecordingCompleted(body);
      // Aquí podrías llamar a tu servicio para descargar el video
    }
    

    return { status: 'ok' };
  }

  /*async getAccessToken() {
    const tokenUrl = 'https://zoom.us/oauth/token?grant_type=client_credentials';
    const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    try {
      const response = await axios.post(tokenUrl, null, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          //'Content-Type': 'application/x-www-form-urlencoded', // Si es necesario para tu API
        },
      });
      
      if (response.data.access_token) {
        console.log('Access Token:', response.data);
      } else {
        console.error('No se encontró el token en la respuesta');
      }
    } catch (error) {
      console.error('Error al obtener el token:', error.response?.data || error.message);
    }
  }*/

  async getAccessToken() {
    const tokenUrl = 'https://zoom.us/oauth/token';

    const authHeader = Buffer.from(
      `${this.clientId}:${this.clientSecret}`
    ).toString('base64');

    try {
      const response = await axios.post(
        tokenUrl,
        null,
        {
          params: {
            grant_type: 'account_credentials',
            account_id: this.accountId, // OBLIGATORIO con Server-to-Server
          },
          headers: {
            'Authorization': `Basic ${authHeader}`,
          },
        }
      );

      console.log('Token Zoom:', response.data);

      //return response.data;

      this.dataToken = {
        access_token: response.data.access_token,
        expires_in: Date.now()
      }

      console.log('MITOKENNNNN ', this.dataToken);
    
    } catch (error) {
      console.error('Error al obtener el token:', error.response?.data || error.message);
      throw error;
    }
  }

}
