import { Injectable, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';
import * as fs from 'fs';
import { MeetingStartedEvent, RecordingCompletedEvent, RecordingStartedEvent, RecordingStoppedEvent, SummaryCompletedEvent, TranscriptCompletedEvent, ZoomWebhookEvent } from 'src/interfaces/miInterface.interface';
import axios from 'axios';
import { ZoomFileService } from './zoom-file.service';

@Injectable()
export class ZoomWebhookService {

   private readonly zoomAppSecretToken = process.env.ZOOM_APP_SECRET_TOKEN ?? '';
   private readonly logger = new Logger(ZoomWebhookService.name);

   constructor(private readonly zoomFileService: ZoomFileService) { }

   async processEvent(body: ZoomWebhookEvent) {
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
      return {
         plainToken,
         encryptedToken: createHmac('sha256', this.zoomAppSecretToken)
            .update(plainToken)
            .digest('hex'),
      };
   }

   private onMeetingStarted(e: MeetingStartedEvent) {
      console.log('➡️ Reunión iniciada:');
   }

   private onRecordingStarted(e: RecordingStartedEvent) {
      console.log('🎬 Grabación iniciada:');
   }

   private onRecordingStopped(e: RecordingStoppedEvent) {
      console.log('🛑 Grabación detenida:');
   }

   private async onRecordingCompleted(e: RecordingCompletedEvent) {
      try {
         const { download_token, payload } = e;
         const recordedVideos = payload.object.recording_files.filter(obj => obj.file_type === 'MP4');

         const folderPath = this.zoomFileService.getFolderPath(payload.object.uuid);

         for (const file of recordedVideos) {

            const fileName = `${file.id}.${file.file_extension.toLowerCase()}`;

            const filePath = this.zoomFileService.getFilePath(folderPath, fileName);

            //await this.zoomFileService.downloadFile(file.download_url, download_token, filePath, fileName);
            await this.downloadVideo(download_token, file.download_url, filePath);
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
      download_token: string, download_url: string, filePath: string
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
         writer.on('finish', () => resolve());       // ✅ envolver en arrow sin parámetros
         writer.on('error', (err) => reject(err));  // ✅ pasar el error explícitamente
      });

      this.logger.log(`Video guardado en ${filePath}`);
   }

   /**
    * Evento: meeting.summary_completed
    * @param e 
    */
   private async onSummaryCompleted(e: SummaryCompletedEvent) {
      try {
         const { payload } = e;
         const { summary_title: summaryTitle, summary_content: summaryContent, meeting_uuid: meetingUuid } = payload.object;

         const folderPath = this.zoomFileService.getFolderPath(meetingUuid);

         const filePath = this.zoomFileService.getFilePath(folderPath, meetingUuid);

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

      }
   }

   /**
   * Convertir SummaryContent a html
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
    * Evento recording.transcript_completed
    * @param e 
    */
   private async onTranscriptCompleted(e: TranscriptCompletedEvent) {
      try {
         const { download_token, payload } = e;
         const folderPath = this.zoomFileService.getFolderPath(payload.object.uuid);
         const filePath = this.zoomFileService.getFilePath(folderPath, e.payload.object.uuid);
         this.downloadTranscription(
            download_token,
            e.payload.object.recording_files[0].download_url,
            filePath);

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
   private async downloadTranscription(downloadToken: string, downloadUrl: string, filePath: string) {
      try {
         const response = await axios.get(downloadUrl, {
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
