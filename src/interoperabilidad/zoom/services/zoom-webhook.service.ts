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
        return this.validateEndpoint(body.payload.plain_token);
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

  /**
   * Evento validar url
   * @param plainToken 
   * @returns 
   */
  private validateEndpoint(plainToken: string) {
    return {
      plainToken,
      encryptedToken: createHmac('sha256', this.zoomAppSecretToken)
        .update(plainToken)
        .digest('hex'),
    };
  }

  /**
   * Evento Reunion Iniciada
   * @param e 
   */
  private onMeetingStarted(e: MeetingStartedEventDto) {
    console.log('➡️ Reunión iniciada:');
    console.log(e.payload.object.start_time);
  }

  /**
   * Evento Grabacion iniciada
   * @param e 
   */
  private async onRecordingStarted(e: RecordingStartedEventDto) {
    const updateAudienciaDetalle: UpdateAudienciaDetalleDto = {
      fechaHoraInicioGrabacion: new Date(e.event_ts)
    }
    const idReunion = e.payload.object.uuid;
    await this.audienciaDetalleService.updateAudienciaDetalle(idReunion, updateAudienciaDetalle);
  }

  /**
   * Evento Grabacion terminada
   * @param e 
   */
  private async onRecordingStopped(e: RecordingStoppedEventDto) {
    const updateAudienciaDetalle: UpdateAudienciaDetalleDto = {
      fechaHoraFinGrabacion: new Date(e.event_ts)
    }
    const idReunion = e.payload.object.uuid;
    await this.audienciaDetalleService.updateAudienciaDetalle(idReunion, updateAudienciaDetalle);
  }

  /**
   * Evento Grabacion completa
   * @param e 
   */
  private async onRecordingCompleted(e: RecordingCompletedEventDto) {
    console.log('➡️ Rcording completed:');
    try {
      const { download_token, payload } = e;

      const recordedVideos: RecordingFileInfoDto[] =
        payload.object.recording_files.filter((obj) => obj.file_extension === 'MP4');

      const folderPath = this.zoomFileService.getFolderPath(
        payload.object.uuid,
      );

      for (const file of recordedVideos) {
        const fileName = `${file.recording_start}`;

        const filePath = this.zoomFileService.getFilePathVideo(
          folderPath,
          fileName,
        );

        await this.downloadVideo(
          download_token,
          file.download_url,
          `${filePath}${file.file_extension.toLowerCase()}`,
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
        Authorization: `Bearer ${download_token}`,
      },
      responseType: 'stream',
    });

    response.data.pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', () => resolve());
      writer.on('error', (err) => reject(err));
    });

    this.logger.log(`Video guardado en ${filePath}`);
  }

  /**
   * Evento: meeting.summary_completed
   * @param e
   */
  private onSummaryCompleted(e: SummaryCompletedEventDto) {
    console.log('➡️ Summary completed:');
    try {
      const { payload } = e;
      const {
        summary_title,
        summary_content,
        meeting_uuid
      } = payload.object;

      const folderPath = this.zoomFileService.getFolderPath(meeting_uuid);

      const filePath = this.zoomFileService.getFilePath(folderPath, meeting_uuid);

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
               <h1>${summary_title}</h1>
               ${this.markdownToHtml(summary_content)}
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
        converted = converted.replace(/^- (.*$)/gim, '<li>$1</li>'); //TODO>M
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
    try {
      const { download_token, payload } = e;
      const folderPath = this.zoomFileService.getFolderPath(
        payload.object.uuid,
      );
      const filePath = this.zoomFileService.getFilePath(
        folderPath,
        e.payload.object.uuid,
      );

      await this.downloadTranscription(
        download_token,
        e.payload.object.recording_files[0].download_url,
        filePath,
      );
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
}
