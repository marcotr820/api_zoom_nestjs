import { IsString, ValidateNested } from "class-validator";
import { ZoomEventBaseDto, ZoomEventBasePayloadDto } from "./event-base.dto";
import { Expose, Type } from "class-transformer";

export class MeetingStartedObjectDto {

  @Expose({ name: 'start_time' })
  @IsString()
  startTime: string;

  @Expose() 
  @IsString()
  uuid: string;

}

export class MeetingStartedPayloadDto extends ZoomEventBasePayloadDto {
  @Expose()        // <-- ¡NECESARIO!
  @ValidateNested()
  @Type(() => MeetingStartedObjectDto)
  declare object: MeetingStartedObjectDto
}

export class MeetingStartedEventDto extends ZoomEventBaseDto {

  /**
   * ¿Por qué declare? Porque:
  La propiedad event ya existe en la clase base
  En la clase derivada solo quieres “narrowear” el tipo (más específico)
  No quieres volver a inicializarla ni crear una nueva propiedad
  Por eso se usa declare, que significa:
  "Esta propiedad ya existe en la clase padre; solo quiero definir un tipo más estricto aquí".
  */

  @Expose()
  declare event: 'meeting.started';

  @Expose()
  @ValidateNested()
  @Type(() => MeetingStartedPayloadDto)
  declare payload: MeetingStartedPayloadDto;

}



