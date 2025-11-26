import { Module } from '@nestjs/common';
import { AudienciasDetallesService } from './audiencias-detalles.service';
import { AudienciaDetalleRepository } from './repositories/audiencia-detalle.repository';

@Module({
  providers: [AudienciasDetallesService, AudienciaDetalleRepository],
  exports: [AudienciasDetallesService, AudienciaDetalleRepository]
})
export class AudienciasDetallesModule {}
