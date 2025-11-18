import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async handleRecordingCompleted(body: any) {
    const files = body.payload.object.recording_files;

    console.log('Archivos disponibles:', files.length);

    for (const file of files) {
      await this.downloadRecordingFile(file);
    }
  }

  // DESCARGAR CADA ARCHIVO
  /*async downloadRecordingFile(file: any, access_token:string) {

    const url = `${file.download_url}?access_token=${access_token}`;

    const fileName = `${file.id}.${file.file_extension}`;
    const filePath = path.join(__dirname, '../../downloads', fileName);

    console.log("Descargando:", url);

    const writer = fs.createWriteStream(filePath);

    const response = await axios.get(url, {
        responseType: 'arraybuffer',
      });

    response.data.pipe(writer);

    return new Promise((resolve) => {
      writer.on('finish', () => {
        console.log("Archivo guardado:", filePath);
        resolve(true);
      });
    });
  }*/

  async downloadRecordingFile(
    file: any
  ): Promise<boolean> {
    try {
      //const url = `${file.download_url}?access_token=${access_token}`;
      // Asegurar extensión en minúsculas
      const extension = file.file_extension?.toLowerCase() || 'dat';

      const downloadsFolder = path.join(__dirname, '../../downloads');

      // Crear carpeta si no existe
      if (!fs.existsSync(downloadsFolder)) {
        fs.mkdirSync(downloadsFolder, { recursive: true });
      }

      const fileName = `${file.id}.${extension}`;
      const filePath = path.join(downloadsFolder, fileName);

      console.log(`📥 Descargando archivo desde: ${file.download_url}`);

      // Solicitar como stream, mejor que arraybuffer
      const response = await axios.get(file.download_url, {
        responseType: 'stream',
        headers: {
          Authorization: `Bearer eyJzdiI6IjAwMDAwMiIsImFsZyI6IkhTNTEyIiwidiI6IjIuMCIsImtpZCI6ImEyNjAyNjU0LWY4M2EtNGExNi05ZWE2LTZiN2Y2OTI1MDQ0ZCJ9.eyJhdWQiOiJodHRwczovL29hdXRoLnpvb20udXMiLCJ1aWQiOiJXRExaQ2ZnQ1RrZTV2bVd3NUt0clVRIiwidmVyIjoxMCwiYXVpZCI6ImVlNmVlNGZmOGUzZDYzYmY2ODZmMTFiMTJlZDAyYjAzMzIyZjI1ZGZmMzdlZGMzYzFkYWViY2I3NmE5ODEwNmQiLCJuYmYiOjE3NjM0MzM1MzgsImNvZGUiOiJkZ2ZYOFZxUlFqMl95Ni1HQWZ6SGZnTWFxVXpYQkc4V0UiLCJpc3MiOiJ6bTpjaWQ6eG05c3pxd3VTNjJpZ2lSQ1JKUmx3QSIsImdubyI6MCwiZXhwIjoxNzYzNDM3MTM4LCJ0eXBlIjozLCJpYXQiOjE3NjM0MzM1MzgsImFpZCI6InlMUnlGRzVkUlppSkwyQWhxMV9vUXcifQ.Dgux-FRDZ2KIXZFpy-dc_yTj0jvSQyKIMl3u0OJwY2Lh0dl-EvDk64Od_XYXSPx0XIe4vRp7GYUGZQiNYYEEhA`,
        },
      });

      // Stream hacia archivo
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      // Envolver en promesa para esperar finalización
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`✅ Archivo guardado en: ${filePath}`);
          resolve(true);
        });

        writer.on('error', (err) => {
          console.error('❌ Error escribiendo archivo:', err);
          reject(err);
        });
      });
    } catch (error) {
      console.error('❌ Error descargando archivo de Zoom:', error);
      return false;
    }
  }
}
