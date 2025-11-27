import { IsString, ValidateNested } from "class-validator";
import { ZoomEventBaseDto, ZoomEventBasePayloadDto } from "./event-base.dto";
import { Expose, Type } from "class-transformer";

export class RecordingCompletedEventDto extends ZoomEventBaseDto {
  declare event: 'recording.completed';

  @ValidateNested()
  @Type(() => RecordingCompletedPayloadDto)
  declare payload: RecordingCompletedPayloadDto;

  @Expose({ name: 'download_token' })
  @IsString()
  declare downloadToken: string;
}

export class RecordingCompletedPayloadDto extends ZoomEventBasePayloadDto {

  @ValidateNested()
  @Type(() => RecordingCompletedObjectDto)
  declare object: RecordingCompletedObjectDto;
}

export class RecordingCompletedObjectDto {
  @IsString()
  uuid: string

  @Expose({ name: 'start_time' })
  @IsString()
  startTime: string

  @Expose({ name: 'recording_files' })
  @ValidateNested({ each: true })
  @Type(() => RecordingFileInfoDto)
  recordingFiles: RecordingFileInfoDto[]
}

export class RecordingFileInfoDto {
  @IsString()
  id: string

  @Expose({ name: 'meeting_id' })
  @IsString()
  meetingId: string

  @Expose({ name: 'recording_start' })
  @IsString()
  recordingStart: string

  @Expose({ name: 'recording_end' })
  @IsString()
  recordingEnd: string

  @Expose({ name: 'file_type' })
  @IsString()
  fileType: string

  @Expose({ name: 'file_extension' })
  @IsString()
  fileExtension: string

  @Expose({ name: 'download_url' })
  @IsString()
  downloadUrl: string
}