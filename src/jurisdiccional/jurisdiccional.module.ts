import { Module } from '@nestjs/common';
import { AudienciasDetallesModule } from './audiecias-detalles/audiencias-detalles.module';

@Module({
  imports: [AudienciasDetallesModule],
})
export class JurisdiccionalModule {}
