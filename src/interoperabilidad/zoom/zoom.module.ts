import { Module } from '@nestjs/common';
import { AudienciasDetallesModule } from 'src/jurisdiccional/audiecias-detalles/audiencias-detalles.module';

@Module({
    imports: [AudienciasDetallesModule]
})
export class ZoomModule {}
