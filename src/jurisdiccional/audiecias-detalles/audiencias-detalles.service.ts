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
   * @param uuid 
   * @param updateAudienciaDetalleDto 
   * @returns 
   */
  async updateAudienciaDetalle(uuid: string, updateAudienciaDetalleDto: UpdateAudienciaDetalleDto) {
    return this.dataSource
      .transaction(async manager => {
        return this.audienciaDetalleRepository.updateTransaccion(manager, uuid, updateAudienciaDetalleDto);
      })
      .catch(e => {
        //throw new UnprocessableEntityException(e.message, Message.errorCreate(this.entityNameMessage));
      });
  }

}
