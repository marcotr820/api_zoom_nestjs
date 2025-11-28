import { Module } from '@nestjs/common';
import { AudienciasDetallesModule } from 'src/jurisdiccional/audiecias-detalles/audiencias-detalles.module';
import { ZoomController } from './zoom.controller';
import { ZoomFileService } from './services/zoom-file.service';
import { ZoomTokenService } from './services/zoom-token.service';
import { ZoomWebhookService } from './services/zoom-webhook.service';

@Module({
    imports: [AudienciasDetallesModule],
    controllers: [ZoomController],
    providers: [ZoomFileService, ZoomTokenService, ZoomWebhookService]
})
export class ZoomModule {}
