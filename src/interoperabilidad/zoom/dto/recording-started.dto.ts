import { Expose, Type } from "class-transformer";
import { IsNumber, IsString, ValidateNested } from "class-validator";
import { ZoomEventBaseDto, ZoomEventBasePayloadDto } from "./event-base.dto";

export class RecordingStartedEventDto extends ZoomEventBaseDto {

  declare event: 'recording.started';

  @ValidateNested()
  @Type(() => RecordingStartedPayloadDto)
  declare payload: RecordingStartedPayloadDto;
}

export class RecordingStartedPayloadDto extends ZoomEventBasePayloadDto {
  @ValidateNested()
  @Type(() => RecordingStartedObjectDto)
  declare object: RecordingStartedObjectDto;
}

export class RecordingStartedObjectDto {
  @IsString()
  uuid: string;

  @IsNumber()
  id: number;

  @IsString()
  host_id: string;

  @IsString()
  topic: string;

  @IsString()
  start_time: string;

  @IsString()
  timezone: string;

  @IsNumber()
  duration: number;

}
