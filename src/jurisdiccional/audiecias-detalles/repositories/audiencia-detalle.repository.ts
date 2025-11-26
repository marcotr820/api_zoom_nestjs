import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { UpdateAudienciaDetalleDto } from '../dto/update-audiencia-detalle';
import { AudienciaDetalle } from '../entities/audiencia-detalle.entity';

@Injectable()
export class AudienciaDetalleRepository {

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
    updateAudienciaDetalleDto: UpdateAudienciaDetalleDto,
  ) {
    const audienciaDetalleBd = await this.findByUuid(idReunion, managerParam);

    if (!audienciaDetalleBd) return;
    
    const audienciaDetalle = managerParam.create(AudienciaDetalle, updateAudienciaDetalleDto); //TODO: M no necesita await

    audienciaDetalle.id = audienciaDetalleBd.id;
    audienciaDetalle.fechaHoraInicioGrabacion = new Date("2025-11-26T19:14:12Z");

    await managerParam.getRepository(AudienciaDetalle).save(audienciaDetalle);
  }

  //TODO:M crear un metodo para obtener el audiencia_detalle por uuid
  /**
   * Obtener audiencia_detalle por uuid
   * @param uuid 
   * @param managerParam 
   * @returns 
   */
  private async findByUuid (idReunion: string, managerParam?: EntityManager) {
    const manager = managerParam ?? this.dataSource.manager;
    try {
      return await manager.getRepository(AudienciaDetalle).findOne({ where: { idReunion } });
    } catch (error) {
      console.error('Error al obtener AudienciaDetalle por idReunion:', error);
    }
    
  }
}
