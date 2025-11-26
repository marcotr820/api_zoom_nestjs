import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('pk_audiencias_detalles', ['id'], { unique: true })
@Entity('audiencias_detalles', { schema: 'jurisdiccional' })
export class AudienciaDetalle extends AuditoriaEntity {
  @PrimaryGeneratedColumn('identity', { type: 'int8', generatedIdentity: 'ALWAYS' })
  id: string;

  @Column('int8', { name: 'id_audiencia' })
  idAudiencia: Audiencia['id'];

  @Column('int2', { name: 'id_sala_audiencia', nullable: true })
  idSalaAudiencia: SalaAudiencia['id'];

  @Column('int2', { name: 'id_estado_audiencia' })
  idEstadoAudiencia: TipoEstadoAudiencia['id'];

  @Column('int8', { name: 'id_archivo_videograbacion', nullable: true })
  idArchivoVideograbacion?: Documento['id'];

  @Column('int8', { name: 'id_archivo_transcripcion_videograbacion', nullable: true })
  idArchivoTranscripcionVideograbacion?: Documento['id'];

  @Column('character varying', { name: 'modalidad', length: 10 })
  modalidad: string;

  @Column('timestamp without time zone', { name: 'fecha_hora_inicio' })
  fechaHoraInicio: Date;

  @Column('timestamp without time zone', { name: 'fecha_hora_fin' })
  fechaHoraFin: Date;

  @Column('timestamp without time zone', { name: 'fecha_hora_inicio_grabacion', nullable: true })
  fechaHoraInicioGrabacion: Date;

  @Column('timestamp without time zone', { name: 'fecha_hora_fin_grabacion', nullable: true })
  fechaHoraFinGrabacion: Date;

  @Column('time', { name: 'duracion_grabacion', nullable: true })
  duracionGrabacion: Date;

  @Column({name: 'id_reunion', type: 'varchar', nullable: true, length: 25})
  idReunion?: string
}
