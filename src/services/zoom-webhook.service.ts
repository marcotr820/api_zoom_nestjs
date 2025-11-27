import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';
import * as fs from 'fs';
import axios from 'axios';
import { ZoomFileService } from './zoom-file.service';
import { AudienciasDetallesService } from 'src/jurisdiccional/audiecias-detalles/audiencias-detalles.service';
import { UpdateAudienciaDetalleDto } from 'src/jurisdiccional/audiecias-detalles/dto/update-audiencia-detalle';
import { ZoomWebhookEventDto } from 'src/interoperabilidad/zoom/dto/event-webhook.dto';
import { RecordingStartedEventDto } from 'src/interoperabilidad/zoom/dto/recording-started.dto';
import { MeetingStartedEventDto } from 'src/interoperabilidad/zoom/dto/meeting-started.dto';
import { RecordingStoppedEventDto } from 'src/interoperabilidad/zoom/dto/recording-stopped.dto';
import { RecordingCompletedEventDto, RecordingFileInfoDto } from 'src/interoperabilidad/zoom/dto/recording-completed.dto';
import { SummaryCompletedEventDto } from 'src/interoperabilidad/zoom/dto/summary-completed.dto';
import { TranscriptCompletedEventDto } from 'src/interoperabilidad/zoom/dto/transcript-completed.dto';

@Injectable()
export class ZoomWebhookService {
  private readonly zoomAppSecretToken = process.env.ZOOM_APP_SECRET_TOKEN ?? '';
  private readonly logger = new Logger(ZoomWebhookService.name);

  constructor(
    private readonly zoomFileService: ZoomFileService,
    private readonly audienciaDetalleService: AudienciasDetallesService,
  ) {}

  async processEvent(body: ZoomWebhookEventDto) {
    switch (body.event) {
      case 'endpoint.url_validation':
        return this.validateEndpoint(body.payload.plainToken);
      case 'meeting.started':
        return this.onMeetingStarted(body);
      case 'recording.started':
        return this.onRecordingStarted(body);
      case 'recording.stopped':
        return this.onRecordingStopped(body);
      case 'meeting.summary_completed':
        return this.onSummaryCompleted(body);
      case 'recording.transcript_completed':
        return this.onTranscriptCompleted(body);
      case 'recording.completed':
        return this.onRecordingCompleted(body);
      default:
        break;
    }
  }

  private validateEndpoint(plainToken: string) {
    console.log('LLAMADA A VALIDATE URL', plainToken);

    console.log('SECRET TOKEN', this.zoomAppSecretToken);
    
    return {
      plainToken,
      encryptedToken: createHmac('sha256', this.zoomAppSecretToken)
        .update(plainToken)
        .digest('hex'),
    };
  }

  private onMeetingStarted(e: MeetingStartedEventDto) {
    console.log('➡️ Reunión iniciada:');
    console.log(e.payload.object.startTime);
  }

  private async onRecordingStarted(e: RecordingStartedEventDto) {
    const updateAudienciaDetalle: UpdateAudienciaDetalleDto = {}
    await this.audienciaDetalleService.updateAudienciaDetalle(
      e.payload.object.uuid, updateAudienciaDetalle);
  }

  private onRecordingStopped(e: RecordingStoppedEventDto) {
    console.log('🛑 Grabación detenida:');
  }

  private async onRecordingCompleted(e: RecordingCompletedEventDto) {
    console.log('➡️ Rcording completed:');
    console.log(e);
    
    try {
      const { downloadToken, payload } = e;

      const recordedVideos: RecordingFileInfoDto[] =
        payload.object.recordingFiles.filter((obj) => obj.fileExtension === 'MP4');

      const folderPath = this.zoomFileService.getFolderPath(
        payload.object.uuid,
      );

      for (const file of recordedVideos) {
        const fileName = `${file.recordingStart}`;

        const filePath = this.zoomFileService.getFilePathVideo(
          folderPath,
          fileName,
        );

        //await this.zoomFileService.downloadFile(file.download_url, download_token, filePath, `${fileName}mp4`);
        await this.downloadVideo(
          downloadToken,
          file.downloadUrl,
          `${filePath}${file.fileExtension.toLowerCase()}`,
        );
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }
  }

  /**
   * Descargar zoom video
   * @param download_token
   * @param download_url
   * @param filePath
   */
  private async downloadVideo(
    download_token: string,
    download_url: string,
    filePath: string,
  ) {
    const writer = fs.createWriteStream(filePath);

    const response = await axios.get(download_url, {
      headers: {
        Authorization: `Bearer ${download_token}`, // token del que viene en el evento recording.completed -> e.download_token
      },
      responseType: 'stream',
    });

    response.data.pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', () => resolve()); // ✅ envolver en arrow sin parámetros
      writer.on('error', (err) => reject(err)); // ✅ pasar el error explícitamente
    });

    this.logger.log(`Video guardado en ${filePath}`);
  }

  /**
   * Evento: meeting.summary_completed
   * @param e
   */
  private onSummaryCompleted(e: SummaryCompletedEventDto) {
    console.log('➡️ Summary completed:');
    console.log(e);
    try {
      const { payload } = e;
      const {
        summaryTitle,
        summaryContent,
        meetingUuid
      } = payload.object;

      const folderPath = this.zoomFileService.getFolderPath(meetingUuid);

      const filePath = this.zoomFileService.getFilePath(
        folderPath,
        meetingUuid,
      );

      // Convertimos Markdown básico a HTML (solo reemplazando saltos de línea y títulos simples)
      const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
               <meta charset="utf-8">
               <title>Resumen de Zoom</title>
               <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
                  h1, h2, h3 { color: #333; }
                  a { color: #0066cc; word-break: break-all; }
                  pre { background: #f4f4f4; padding: 10px; }
               </style>
            </head>
            <body>
               <h1>${summaryTitle}</h1>
               ${this.markdownToHtml(summaryContent)}
            </body>
            </html>
         `;

      fs.writeFileSync(`${filePath}.html`, htmlContent);
    } catch (error) {
      throw new BadRequestException(error.response?.data || error.message);
    }
  }

  /**
   * Convertir SummaryContent a html
   */
  private markdownToHtml(markdown?: string): string {
    if (!markdown) return 'Sin contenido.';

    // Separar por párrafos (doble salto o más)
    const paragraphs = markdown.split(/\n{2,}/g);

    // Convertir cada párrafo en <p>...</p>, reemplazando saltos simples dentro por <br/>
    const html = paragraphs
      .map((p) => {
        // Convertir títulos dentro del párrafo
        let converted = p;

        converted = converted.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        converted = converted.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        converted = converted.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Convertir listas
        converted = converted.replace(/^\- (.*$)/gim, '<li>$1</li>');
        converted = converted.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');

        // Convertir links
        converted = converted.replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" target="_blank">$1</a>',
        );

        // Ahora reemplazar saltos simples de línea por <br/>
        converted = converted.replace(/\n/g, '<br/>');

        // Si el párrafo ya contiene un título o lista, devolver tal cual para no envolver en <p>
        if (/^<h[1-6]>/.test(converted) || /^<ul>/.test(converted)) {
          return converted;
        }

        return `<p>${converted}</p>`;
      })
      .join('\n');

    return html;
  }

  /**
   * Evento recording.transcript_completed
   * @param e
   */
  private async onTranscriptCompleted(e: TranscriptCompletedEventDto) {
    console.log('➡️ transcript completed:');
    console.log(e);
    try {
      const { downloadToken, payload } = e;
      const folderPath = this.zoomFileService.getFolderPath(
        payload.object.uuid,
      );
      const filePath = this.zoomFileService.getFilePath(
        folderPath,
        e.payload.object.uuid,
      );

      console.log(e);
      
      /*await this.downloadTranscription(
        downloadToken,
        e.payload.object.recordingFiles[0].downloadUrl,
        filePath,
      );*/
    } catch (err) {
      console.error('Error al descargar la transcripción:', err.message);
      throw err;
    }
  }

  /**
   * Descargar transcripcion
   * @param downloadUrl
   * @param filePath
   */
  private async downloadTranscription(
    downloadToken: string,
    downloadUrl: string,
    filePath: string,
  ) {
    try {
      const response = await axios.get<string>(downloadUrl, {
        responseType: 'text', // transcripción viene como texto
        headers: {
          Authorization: `Bearer ${downloadToken}`, // Token del webhook
        },
      });

      // Guardar archivo
      fs.writeFileSync(`${filePath}.vtt`, response.data, 'utf8');

      this.logger.log(`Transcripción guardado en ${filePath}`);
    } catch (err) {
      console.error('Error al descargar la transcripción:', err.message);
      throw err;
    }
  }

  /*async getCurrentMeet() {
    const accessToken = await this.zoomTokenService.getS2SToken();

    const meetingId = this.extractMeetingId('https://organojudicial-gob-bo.zoom.us/j/5157599468?pwd=GMQiQCmQacYX76iyhYIsHNyEXWxNGK.1&omn=89745592454');

    const url = `https://api.zoom.us/v2/meetings/${meetingId}`;

    const res = await axios.get<ZoomMeetingDetails>(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log(res.data.uuid, res.data.status);
  }*/

  /*private extractMeetingId(url: string): string | null {
    const match = url.match(/\/(j|s)\/(\d+)/);
    return match ? match[2] : null;
  }*/
}
