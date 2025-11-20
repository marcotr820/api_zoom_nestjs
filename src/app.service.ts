import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

import { MeetingEndedEvent, MeetingStartedEvent, RecordingCompletedEvent, RecordingPausedEvent, RecordingResumedEvent, RecordingStartedEvent, RecordingStoppedEvent, ZoomRecording, ZoomTokenData, ZoomWebhookEvent } from './interfaces/miInterface.interface';
import { createHmac } from 'crypto';

@Injectable()
export class AppService {

  private readonly accountId = process.env.ZOOM_APP_ACCOUNT_ID ?? '';
  private readonly clientId = process.env.ZOOM_APP_CLIEND_ID ?? '';
  private readonly clientSecret = process.env.ZOOM_APP_CLIENT_SECRET ?? '';
  private readonly zoomAppSecretToken = process.env.ZOOM_APP_SECRET_TOKEN ?? '';
  private readonly logger = new Logger(AppService.name);

  async processEvent(body: ZoomWebhookEvent | any) {

    switch (body.event) {
      case 'endpoint.url_validation':
        return this.onEndpointUrlValidarion(body.payload.plainToken);
      /*case 'meeting.started':
        return this.onMeetingStarted(body);
      case 'meeting.ended':
        return this.onMeetingEnded(body);
      case 'recording.started':
        return this.onRecordingStarted(body);*/
      //case 'recording.stopped':
      //return this.onRecordingStopped(body);
      /*case 'recording.paused':
        return this.onRecordingPaused(body);
      case 'recording.resumed':
        return this.onRecordingResumed(body);*/
      case 'recording.completed':
        return this.onRecordingCompleted(body);

      case 'meeting.summary_completed':
        this.saveSummaryAsHtml(
          body.payload.object.summary_content,
          body.payload.object.summary_title,
          body.payload.object.meeting_uuid
        );
        return;
      case 'recording.transcript_completed':
        /*console.log('TRANSCRIPT_COMPLETED(TRANSCRIPCION)', body);
        console.log('FILES_TRANSCRIPT', body.payload.object.recording_files);
        return this.downloadTranscript(
          body.payload.object.recording_files[0].download_url,
          body.download_token,
          body.payload.object.recording_files[0].meeting_id
        );*/
        return;
      case 'meeting.aic_transcript_completed':
        return;
      /*case 'meeting.aic_transcript_completed':
        console.log('AIC_TRANSCRIPT_COMPLETED(AIC TRANSCRIPCION)', body);*/
      default:
        console.log('Evento desconocido:', body.event);

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
    console.log('🛑 Grabación detenida:', e);
  }

  private onRecordingPaused(e: RecordingPausedEvent) {
    console.log('⏸ Grabación en pausa');
  }

  private onRecordingResumed(e: RecordingResumedEvent) {
    console.log('▶️ Grabación reanudada');
  }

  /**
   * Obtener token y url para mandarlos
   * @param e
   */
  private async onRecordingCompleted(e: RecordingCompletedEvent) {
    try {

      const tokenS2S = e.download_token //await this.getAccessTokenS2S();

      // * Obtener links de grabación
      const recordingFiles = e.payload.object.recording_files.filter(obj => obj.file_type === 'MP4') as ZoomRecording[] //await this.getRecordingFiles(e.payload.object.uuid);
      console.log('URL links', recordingFiles);

      // Crear carpeta 'summaries' si no existe
      const dir = path.join(__dirname, '..', 'videos');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Ruta de la carpeta específica dentro de "videos" que sera el id de la reunion
      const folderPath = path.join(dir, this.sanitizeFilename(recordingFiles[0].meeting_id));

      // Verifica si existe la carpeta específica
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
        console.log(`Carpeta "${folderPath}" creada dentro de "videos"`);
      }

      for (const file of recordingFiles) {
        const fileName = `${file.id}.${file.file_type.toLowerCase()}`;
        const filePath = path.join(folderPath, fileName); // ← aquí es donde se guarda el archivo
        
        //const downloadUrl = `${file.download_url}`; // URL que devuelve la API
        const writer = fs.createWriteStream(filePath);
        
        const response = await axios.get(file.download_url, {
          headers: {
            Authorization: `Bearer ${tokenS2S}`, // token del que viene en el evento recording.completed -> e.download_token
          },
          responseType: 'stream',
        });

        response.data.pipe(writer);

        await new Promise<void>((resolve, reject) => {
          writer.on('finish', () => resolve());       // ✅ envolver en arrow sin parámetros
          writer.on('error', (err) => reject(err));  // ✅ pasar el error explícitamente
        });

        console.log(`Archivo guardado en ${folderPath}`);
      }

    } catch (error: any) {
      console.error('Error:', error.response?.data || error.message);
    }
  }

  private onEndpointUrlValidarion(plainToken: string) {
    const encryptedToken = createHmac('sha256', this.zoomAppSecretToken)
      .update(plainToken)
      .digest('hex');

    /*this.logger.log('Respondiento challenge a Zoom', {
      plainToken,
      encryptedToken,
    });*/

    return {
      plainToken,
      encryptedToken,
    };
  }

  /**
   * Obtener el token con las credenciales de mi app
   * @returns 
   */
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

  /**
   * Obtener las urls para poder descargar los archivos
   * @param meetingId 
   * @param tokenS2s 
   * @returns 
   */
  private async getRecordingFiles(meetingId: string): Promise<ZoomRecording[]> {
    /*
      Tenemos que realizar esta consulta para que nos permita obtener las url que sirven para descargar
      los documentos, ya que el evento recording.complete nos devuelve las urls de los archivos pero no
      funciona para descargarlos ya se reviso distintas partes de los foros donde se presentaba estos problemas
    */
    try {

      // * Obtener token OAuth S2S
      const tokenS2S = await this.getAccessTokenS2S();

      const recordingsResponse = await axios.get(
        /*`https://api.zoom.us/v2/meetings/${meetingId}/recordings?include_fields=download_access_token&ttl=3600`*/
        `https://api.zoom.us/v2/meetings/${meetingId}/recordings`,
        {
          headers: {
            Authorization: `Bearer ${tokenS2S}`,
          },
        }
      );

      return recordingsResponse.data.recording_files.filter(obj => obj.file_type === 'MP4') as ZoomRecording[];
    } catch (error) {
      throw new HttpException('Error al obtener las grabaciones', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Guardar Summary como html
   */
  private saveSummaryAsHtml(
    summaryContent: string,
    summaryTitle: string,
    filename: string
  ): void {

    // Crear carpeta 'summaries' si no existe
    const dir = path.join(__dirname, '..', 'summaries');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, this.sanitizeFilename(filename));

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

    fs.writeFileSync(filePath, htmlContent);
  }

  /**
   * 
   */
  private markdownToHtml(markdown: string): string {

    if (!markdown) return 'Sin contenido.';

    // Separar por párrafos (doble salto o más)
    const paragraphs = markdown.split(/\n{2,}/g);

    // Convertir cada párrafo en <p>...</p>, reemplazando saltos simples dentro por <br/>
    let html = paragraphs.map(p => {
      // Convertir títulos dentro del párrafo
      let converted = p;

      converted = converted.replace(/^### (.*$)/gim, '<h3>$1</h3>');
      converted = converted.replace(/^## (.*$)/gim, '<h2>$1</h2>');
      converted = converted.replace(/^# (.*$)/gim, '<h1>$1</h1>');

      // Convertir listas
      converted = converted.replace(/^\- (.*$)/gim, '<li>$1</li>');
      converted = converted.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');

      // Convertir links
      converted = converted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

      // Ahora reemplazar saltos simples de línea por <br/>
      converted = converted.replace(/\n/g, '<br/>');

      // Si el párrafo ya contiene un título o lista, devolver tal cual para no envolver en <p>
      if (/^<h[1-6]>/.test(converted) || /^<ul>/.test(converted)) {
        return converted;
      }

      return `<p>${converted}</p>`;
    }).join('\n');

    return html;
  }

  /**
   * Se necesita limpiar el nombre por que al nombrar archivos no se aceptas algunos caracteres
   * y esto impide colocar el nombre a un archivo que contenga estos caracteres
   */
  private sanitizeFilename(name: string): string {
    return name.replace(/[+\/=]/g, '_');
  }

  /**
   * Descargar transcripcion
   */
  async downloadTranscript(downloadUrl: string, downloadToken: string, meetingId: string) {
    try {
      // Crear carpeta si no existe
      const folder = path.join(process.cwd(), 'transcripts');
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }

      // Ruta final donde guardarás el archivo
      const filepath = path.join(folder, `${this.sanitizeFilename(meetingId)}.vtt`);

      // 📌 Descargar la transcripción con el token
      const response = await axios.get(downloadUrl, {
        responseType: 'text', // transcripción viene como texto
        headers: {
          //Authorization: `Bearer ${downloadToken}`, // Token del webhook
        },
      });

      // Guardar archivo
      fs.writeFileSync(filepath, response.data, 'utf8');

      console.log('Transcripción guardada en:', filepath);

      //return filepath;

    } catch (err) {
      console.error('Error al descargar la transcripción:', err.message);
      throw err;
    }
  }

  /**
   * Descargar videos con las URL obtenidas
   */

}
