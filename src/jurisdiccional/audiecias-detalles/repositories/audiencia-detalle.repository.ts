import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { UpdateAudienciaDetalleDto } from '../dto/update-audiencia-detalle';
import { AudienciaDetalle } from '../entities/audiencia-detalle.entity';

@Injectable()
export class AudienciaDetalleRepository {

  private readonly logger = new Logger(AudienciaDetalleRepository.name);
  
  constructor(private dataSource: DataSource){}

  /**
   * Actualizar audiencia_detalle
   * @param managerParam 
   * @param idReunion 
   * @param updateAudienciaDetalleDto 
   */
  async updateTransaccion (
    managerParam: EntityManager,
    idReunion: string,
    dto: UpdateAudienciaDetalleDto,
  ) {
    const repoAD = managerParam.getRepository(AudienciaDetalle);

    const audienciaDetalleBd = await this.findByUuid(idReunion, managerParam);

    if (!audienciaDetalleBd) return;

    if (audienciaDetalleBd.fechaHoraInicioGrabacion && dto.fechaHoraFinGrabacion) {
      const finGrabacion = new Date(dto.fechaHoraFinGrabacion).getTime();
      const inicioGrabacion = new Date(audienciaDetalleBd.fechaHoraInicioGrabacion).getTime();
      const duracionGrabacion = finGrabacion - inicioGrabacion;
      dto.duracionGrabacion = this.convertHHMMSS(duracionGrabacion);
    }
    
    const entity = await repoAD.preload({
      id: audienciaDetalleBd.id,
      ...dto,
    });

    if (!entity) return;

    await repoAD.save(entity);
  }

  //TODO:M crear un metodo para obtener el audiencia_detalle por uuid
  /**
   * Obtener audiencia_detalle por uuid
   * @param uuid 
   * @param managerParam 
   * @returns 
   */
  async findByUuid (idReunion: string, managerParam?: EntityManager) {
    const manager = managerParam ?? this.dataSource.manager;
    try {
      return await manager.getRepository(AudienciaDetalle).findOne({ where: { idReunion } });
    } catch (error) {
      this.logger.error('Error al obtener AudienciaDetalle por idReunion:', error);
    }
  }

  /**
   * Convertir duracion grabacion a HH:MM:SS
   * @param durationMs 
   * @returns
   */
  private convertHHMMSS(durationMs: number): string {
    const seconds = Math.floor((durationMs / 1000) % 60);
    const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
    const hours = Math.floor(durationMs / (1000 * 60 * 60));

    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');

    return `${h}:${m}:${s}`;
  }

}
