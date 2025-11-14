import { Controller, Logger, Post, Req, Res } from '@nestjs/common';
import { createHmac } from 'crypto';
import type { Response, Request } from 'express';

@Controller('webhook')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @Post()
  handleWebhook(@Req() req: Request, @Res() res: Response) {
    const body = req.body; // o req.rawBody si usas rawBody

    const zoomSecret = process.env.ZOOM_SECRET_TOKEN ?? '';

    if (body.event === 'endpoint.url_validation' && body.payload.plainToken) {
      const plainToken = body.payload.plainToken;
      const encryptedToken = createHmac('sha256', zoomSecret)
        .update(plainToken)
        .digest('hex');

      this.logger.log('Respondiento challenge a Zoom', {
        plainToken,
        encryptedToken,
      });

      // ✅ DEVOLVER 200 explícitamente
      return res.status(200).json({
        plainToken,
        encryptedToken,
      });
    }

    return res.status(200).json({ status: 'ok' });
  }
}
