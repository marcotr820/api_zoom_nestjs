import { Injectable } from '@nestjs/common';
import { UpdateAudienciaDetalleDto } from './dto/update-audiencia-detalle';
import { DataSource } from 'typeorm';
import { AudienciaDetalleRepository } from './repositories/audiencia-detalle.repository';

@Injectable()
export class AudienciasDetallesService {

  private readonly entityNameMessage = 'Audiencia Detalle';

  constructor(
    private readonly dataSource: DataSource,
    private readonly audienciaDetalleRepository: AudienciaDetalleRepository
  ){}

  /**
   * Actualizar audiencia detalle
   * @param idReunion 
   * @param updateAudienciaDetalleDto 
   * @returns 
   */
  async updateAudienciaDetalle(idReunion: string, dto: UpdateAudienciaDetalleDto) {
    return await this.dataSource.transaction(async manager => {
        return await this.audienciaDetalleRepository.updateTransaccion(manager, idReunion, dto);
      })
      .catch(e => {
        //throw new UnprocessableEntityException(e.message, Message.errorCreate(this.entityNameMessage));
      });
  }

}
