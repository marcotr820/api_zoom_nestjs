import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Estado } from '../constants/estado.constants';
import { GlobalService } from 'src/autorizacion/auth/global.service';
export abstract class AuditoriaEntity extends BaseEntity {
  @Column('varchar', {
    name: 'usuario_creacion',
    length: 20,
    default: () => 'SESSION_USER',
    select: false,
    comment: 'Registro del usuario de app o  base de datos que creó el registro en acción INSERT',
  })
  usuarioCreacion: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'fecha_creacion',
    default: () => 'now()',
    select: true,
    comment: 'Registro de la fecha y hora (del servidor) de la creación del registro en acción INSERT',
  })
  fechaCreacion: Date;

  @Column('varchar', {
    name: 'usuario_modificacion',
    length: 20,
    default: () => 'SESSION_USER',
    select: true,
    comment: 'Registro del usuario de app o base de datos que modificó el registro con acción UPDATE',
  })
  usuarioModificacion: string;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'fecha_modificacion',
    default: () => 'now()',
    onUpdate: 'now()',
    select: false,
    comment: 'Registro de la fecha y hora (del servidor) de la modificación del registro en acción UPDATE',
  })
  fechaModificacion: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    name: 'fecha_eliminacion',
    select: false,
    comment: 'Registro de la fecha y hora (del servidor) de la eliminación lógica del registro',
  })
  fechaEliminacion: Date;

  @Column('smallint', {
    default: 1,
    select: true,
    comment: 'Enum: -1: eliminado o eliminación lógica, 0: Inactivo, 1: Activo',
  })
  estado: number;

  constructor(data?: Partial<AuditoriaEntity>) {
    super();
    if (data) Object.assign(this, data);
  }

  @BeforeInsert()
  setUsuarioCreacion() {
    if (GlobalService.userNameSession) {
      this.usuarioCreacion = GlobalService.userNameSession;
      this.usuarioModificacion = GlobalService.userNameSession;
    }
  }

  @BeforeUpdate()
  setUsuarioModificacion() {
    if (GlobalService.userNameSession) {
      this.usuarioModificacion = GlobalService.userNameSession;
    }
    if (this.estado == Estado.ELIMINADO) {
      this.fechaEliminacion = new Date();
    }
  }
}
