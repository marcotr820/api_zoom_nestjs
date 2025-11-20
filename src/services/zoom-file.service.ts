import { Injectable, Logger } from '@nestjs/common';
import path from 'path';
import * as fs from 'fs';
import axios from 'axios';

@Injectable()
export class ZoomFileService {

  private readonly logger = new Logger(ZoomFileService.name);

  constructor() { }

  getFolderPath(
    meetingId: string,
  ) {
    // Crear carpeta si no existe
    const dir = path.join(process.cwd(), 'files');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Ruta de la carpeta específica dentro de "files" que sera el id de la reunion
    const folderPath = path.join(dir, this.sanitizeFilename(meetingId));

    // Verifica si existe la carpeta específica
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
      console.log(`Carpeta "${folderPath}" creada dentro de "files"`);
    }

    return folderPath;
  }

  getFilePath(folderPath: string, fileName: string) {
    //const fileName = `${file.id}.${file.file_extension.toLowerCase()}`;
    return path.join(folderPath, this.sanitizeFilename(fileName)); // ← aquí es donde se guarda el archivo
  }

  /**
  * Se necesita limpiar el nombre por que al nombrar archivos no se aceptas algunos caracteres
  * y esto impide colocar el nombre a un archivo que contenga estos caracteres
  */
  private sanitizeFilename(name: string): string {
    return name.replace(/[+\/=]/g, '_');
  }

  /**
   * Guarda un stream en un archivo
   */
  private async saveStreamToFile(stream: NodeJS.ReadableStream, filePath: string) {
    return new Promise<void>((resolve, reject) => {
      const writer = fs.createWriteStream(filePath);
      stream.pipe(writer);

      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  /**
   * Descarga cualquier archivo desde una URL con token Bearer
   * y lo guarda en la carpeta correspondiente
   */
  async downloadFile(
    download_url: string,
    token: string,
    filePath: string,
    filename: string,
  ): Promise<string> {
    try {
      const response = await axios.get(download_url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'stream', // Muy importante para archivos grandes
      });

      // Guardar el stream en disco
      await this.saveStreamToFile(response.data, filePath);

      this.logger.log(`Archivo descargado: ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error(`Error descargando archivo ${filename}: ${error.message}`);
      throw error;
    }
  }

}
