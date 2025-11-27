import { IsString, ValidateNested } from "class-validator";
import { ZoomEventBaseDto, ZoomEventBasePayloadDto } from "./event-base.dto";
import { Expose, Type } from "class-transformer";

export class RecordingCompletedEventDto extends ZoomEventBaseDto {
  declare event: 'recording.completed';

  @ValidateNested()
  @Type(() => RecordingCompletedPayloadDto)
  declare payload: RecordingCompletedPayloadDto;

  @IsString()
  declare download_token: string;
}

export class RecordingCompletedPayloadDto extends ZoomEventBasePayloadDto {
  @ValidateNested()
  @Type(() => RecordingCompletedObjectDto)
  declare object: RecordingCompletedObjectDto;
}

export class RecordingCompletedObjectDto {
  @IsString()
  uuid: string

  @IsString()
  start_time: string

  @ValidateNested({ each: true })
  @Type(() => RecordingFileInfoDto)
  recording_files: RecordingFileInfoDto[]
}

export class RecordingFileInfoDto {
  @IsString()
  id: string

  @IsString()
  meeting_id: string

  @IsString()
  recording_start: string

  @IsString()
  recording_end: string

  @IsString()
  file_type: string

  @IsString()
  file_extension: string

  @IsString()
  download_url: string
}