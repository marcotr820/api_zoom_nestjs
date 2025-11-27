import { IsNumber, IsString, ValidateNested } from "class-validator";
import { ZoomEventBaseDto } from "./event-base.dto";
import { Expose, Type } from "class-transformer";

export class RecordingStoppedEventDto extends ZoomEventBaseDto {

  declare event: 'recording.stopped';

  @ValidateNested()
  @Type(() => RecordingStoppedPayloadDto)
  declare payload: RecordingStoppedPayloadDto;
}

export class RecordingStoppedPayloadDto {

  @ValidateNested()
  @Type(() => RecordingStoppedObjectDto)
  declare object: RecordingStoppedObjectDto;
}

export class RecordingStoppedObjectDto {
  @IsString()
  uuid: string;

  @IsString()
  topic: string;

  @IsString()
  start_time: string;

  @IsNumber()
  duration: number;
}