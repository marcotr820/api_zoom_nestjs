import { Module } from '@nestjs/common';
import { ZoomModule } from './zoom/zoom.module';
import { AudienciasDetallesModule } from 'src/jurisdiccional/audiecias-detalles/audiencias-detalles.module';

@Module({
  imports: [ZoomModule, AudienciasDetallesModule]
})
export class InteroperabilidadModule {}
