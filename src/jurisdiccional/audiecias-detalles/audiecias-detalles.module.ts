import { Module } from '@nestjs/common';
import { AudienciasDetallesService } from './audiencias-detalles.service';

@Module({
  providers: [AudienciasDetallesService]
})
export class AudieciasDetallesModule {}
