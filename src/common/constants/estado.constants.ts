export const Estado: {
  ACTIVO: 1;
  INACTIVO: 0;
  ELIMINADO: -1;
} = {
  ACTIVO: 1,
  INACTIVO: 0,
  ELIMINADO: -1,
};

export const EstadosMemorialExterno: {
  CREADO: 100;
} = {
  CREADO: 100,
};

export const EstadoAp: Omit<typeof Estado, 'INACTIVO' | 'ACTIVO'> & {
  PROYECTO: 5;
  SINRESPUESTA: 4;
  CERRADO: 3;
  ABIERTO: 2;
  PENDIENTE_DE_SORTEO: 15;
  ENVIADO: typeof Estado.ACTIVO;
  PENDIENTE: typeof Estado.INACTIVO;
} = {
  PROYECTO: 5,
  SINRESPUESTA: 4,
  CERRADO: 3,
  ABIERTO: 2,
  PENDIENTE_DE_SORTEO: 15,
  ENVIADO: Estado.ACTIVO,
  PENDIENTE: Estado.INACTIVO,
  ELIMINADO: Estado.ELIMINADO,
};

export const EstadoReparto: {
  INACTIVO: -1;
  BAJA: 0;
  ACTIVO: 1;
  SECUNDARIO: 2;
} = {
  INACTIVO: -1,
  BAJA: 0,
  ACTIVO: 1,
  SECUNDARIO: 2,
};

export const EstadoSujetoProcesal: {
  PRINCIPAL: 'Principal';
} = {
  PRINCIPAL: 'Principal',
};

export type EstadoValuesType = (typeof Estado)[keyof typeof Estado];
