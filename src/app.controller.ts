import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import axios from 'axios';
import { createHmac } from 'crypto';
import { AppService } from './app.service';
import type { ZoomWebhookEvent } from './interfaces/miInterface.interface';

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

  private readonly accountId = process.env.ZOOM_APP_ACCOUNT_ID ?? '';
  private readonly clientId = process.env.ZOOM_APP_CLIEND_ID ?? '';
  private readonly clientSecret = process.env.ZOOM_APP_CLIENT_SECRET ?? '';
  private readonly zoomToken = process.env.ZOOM_APP_TOKEN ?? '';
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService){}

  @Post()
  @HttpCode(200)
  async handleWebhook(@Body() body: ZoomWebhookEvent) {

    if (!body) {
      this.logger.warn('Webhook recibido sin body');
      return { message: 'Body vacío' };
    }

    await this.appService.processEvent(body);

    return;

    // Manejo de eventos normales
    //this.logger.log('Evento autorizado de Zoom', body.event);

    // Aquí podrías manejar otros eventos como recording.started, recording.completed, etc.
    // Ejemplo:
    if (body.event === 'meeting.started') {
      //this.logger.log('Reunion Iniciada');
      //await this.getAccessToken();
    }
    if (body.event === 'recording.started') {
      //this.logger.log('Grabación iniciada', body.payload);
    }
    if (body.event === 'recording.completed') {
      //this.logger.log('Grabación completada', body.payload);
      if (body.payload.object.host_id === 'WDLZCfgCTke5vmWw5KtrUQ') {
        //console.log('evento de marcoa')
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

      /*this.dataToken = {
        access_token: response.data.access_token,
        expires_in: Date.now()
      }*/

      //console.log('MITOKENNNNN ', this.dataToken);
    
    } catch (error) {
      console.error('Error al obtener el token:', error.response?.data || error.message);
      throw error;
    }
  }

}
