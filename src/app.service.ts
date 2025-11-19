import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { MeetingEndedEvent, MeetingStartedEvent, RecordingCompletedEvent, RecordingPausedEvent, RecordingResumedEvent, RecordingStartedEvent, RecordingStoppedEvent, ZoomRecording, ZoomTokenData, ZoomWebhookEvent } from './interfaces/miInterface.interface';
import axios from 'axios';

@Injectable()
export class AppService {

  private readonly accountId = process.env.ZOOM_APP_ACCOUNT_ID ?? '';
  private readonly clientId = process.env.ZOOM_APP_CLIEND_ID ?? '';
  private readonly clientSecret = process.env.ZOOM_APP_CLIENT_SECRET ?? '';
  private readonly zoomAppToken = process.env.ZOOM_APP_TOKEN ?? '';
  private readonly logger = new Logger(AppService.name);

  processEvent(body: ZoomWebhookEvent) {
    switch (body.event) {
      case 'meeting.started':
        return this.onMeetingStarted(body);
      case 'meeting.ended':
        return this.onMeetingEnded(body);
      case 'recording.started':
        return this.onRecordingStarted(body);
      case 'recording.stopped':
        return this.onRecordingStopped(body);
      case 'recording.paused':
        return this.onRecordingPaused(body);
      case 'recording.resumed':
        return this.onRecordingResumed(body);
      case 'recording.completed':
        return this.onRecordingCompleted(body);
      default:
        console.log('Evento desconocido:', body);
    }
  }

  private onMeetingStarted(e: MeetingStartedEvent) {
    console.log('➡️ Reunión iniciada:', e);
  }

  private onMeetingEnded(e: MeetingEndedEvent) {
    console.log('⛔ Reunión finalizada:', e);
  }

  private onRecordingStarted(e: RecordingStartedEvent) {
    console.log('🎬 Grabación iniciada:', e.payload.object.uuid);
  }

  private onRecordingStopped(e: RecordingStoppedEvent) {
    console.log('🛑 Grabación detenida:', e.payload.object.uuid);
  }

  private onRecordingPaused(e: RecordingPausedEvent) {
    console.log('⏸ Grabación en pausa');
  }

  private onRecordingResumed(e: RecordingResumedEvent) {
    console.log('▶️ Grabación reanudada');
  }

  private async onRecordingCompleted(e: RecordingCompletedEvent) {

    try {
      // * Obtener token OAuth S2S
      const tokenS2S = await this.getAccessTokenS2S();

      // * Obtener links de grabación
      const recordingFiles = await this.getRecordingFiles(e.payload.object.uuid, tokenS2S ?? '');
      console.log(recordingFiles);
      

    } catch (error: any) {
      console.error('Error:', error.response?.data || error.message);
    }

    /*console.log(
      '✅ Grabación completada. Archivos:',
      e.payload.object.recording_files.length,
    );

    console.log('🔗 URL compartida:', e.payload.object.share_url);*/
  }

  private async getAccessTokenS2S() {
    const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.accountId}`;

    const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    try {
      const response = await axios.post<ZoomTokenData>(tokenUrl, null, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
        },
      });
      
      if (response.data.access_token) {
        return response.data.access_token;
      } else {
        console.error('No se encontrar el token en la respuesta');
      }
    } catch (error) {
      console.error('Error al obtener el token:', error.response?.data || error.message);
      throw new HttpException('Error al obtener token de Zoom', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async getRecordingFiles(meetingId: string, tokenS2s: string): Promise<ZoomRecording[]> {
    try {
      const recordingsResponse = await axios.get(
        /*`https://api.zoom.us/v2/meetings/${meetingId}/recordings?include_fields=download_access_token&ttl=3600`*/
        `https://api.zoom.us/v2/meetings/${meetingId}/recordings`,
        {
          headers: {
            Authorization: `Bearer ${tokenS2s}`,
          },
        }
      );

      return recordingsResponse.data.recording_files as ZoomRecording[];
    } catch (error) {
      throw new HttpException('Error al obtener las grabaciones', HttpStatus.BAD_REQUEST);
    }
    
  }
}
