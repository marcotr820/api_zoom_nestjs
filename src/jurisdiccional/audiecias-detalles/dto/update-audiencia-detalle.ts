
import { IsDate, IsDefined, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAudienciaDetalleDto /*extends PartialType(CreateAudienciaDetalleDto)*/ {
  @IsOptional()
  id?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  idAudiencia?: string;

  @ApiProperty()
  @IsOptional()
  @IsDate({ message: 'El campo fechaHoraInicio debe ser fecha' })
  @IsDefined({
    message: 'El campo fechaHoraInicio debe estar definido',
  })
  @Type(() => Date)
  fechaHoraInicio?: Date;

  @ApiProperty()
  @IsDate({ message: 'La fechaHoraInicioGrabacion debe ser de tipo fecha.' })
  @Type(() => Date)
  @IsOptional()
  fechaHoraInicioGrabacion?: Date;

  @ApiProperty()
  @IsDate({ message: 'La fechaHoraFinGrabacion debe ser de tipo fecha.' })
  @Type(() => Date)
  @IsOptional()
  fechaHoraFinGrabacion?: Date;

  @ApiProperty()
  @IsOptional()
  @IsString()
  idArchivoVideograbacion?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  duracionGrabacion?: string;

  @ApiProperty()
  @IsDate({ message: 'la fechaHoraFin debe ser de tipo Date' })
  @IsOptional()
  @Type(() => Date)
  fechaHoraFin?: Date;

  @ApiProperty()
  @Type(() => Number)
  idEstadoAudiencia?: number;

  /*@IsOptional()
  @Type(() => CreateAudienciaDetalleExternaDto)
  audienciasDetallesExternas?: CreateAudienciaDetalleExternaDto;*/

  @ApiProperty()
  @IsOptional()
  @IsString()
  idReunion?: string;
}
