import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ZoomTokenService {

  private readonly zoomAppCountId = process.env.ZOOM_APP_ACCOUNT_ID ?? '';
  private readonly zoomAppCliendId = process.env.ZOOM_APP_CLIEND_ID ?? '';
  private readonly zoomAppClientSecret = process.env.ZOOM_APP_CLIENT_SECRET ?? '';
  private readonly zoomAppSecretToken = process.env.ZOOM_APP_SECRET_TOKEN ?? '';

  constructor() { }

  async getS2SToken(): Promise<string> {
    const credentials = Buffer.from(`${this.zoomAppCliendId}:${this.zoomAppClientSecret}`).toString('base64');

    try {
      const response = await axios.post(
        `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.zoomAppCountId}`,
        null,
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const token = response.data.access_token;
      // console.log(token);
      return token;
    } catch (error) {
      console.error('Error obteniendo token S2S:', error.response?.data || error.message);
      throw error;
    }
  }

}
