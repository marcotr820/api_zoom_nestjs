import { IsNumber, IsString, ValidateNested } from "class-validator";
import { ZoomEventBaseDto, ZoomEventBasePayloadDto } from "./event-base.dto";
import { Expose, Type } from "class-transformer";

export class TranscriptCompletedEventDto extends ZoomEventBaseDto {

  declare event: 'recording.transcript_completed';

  @ValidateNested()
  @Type(() => TranscriptCompletedPayloadDto)
  declare payload: TranscriptCompletedPayloadDto;

  @Expose({ name: 'download_token' })
  @IsString()
  declare downloadToken: string;
}

export class TranscriptCompletedPayloadDto extends ZoomEventBasePayloadDto {
  @ValidateNested()
  @Type(() => TranscriptCompletedObjectDto)
  declare object: TranscriptCompletedObjectDto;
}

export class TranscriptCompletedObjectDto {
  @IsString()
  uuid: string //idReunion

  @IsNumber()
  id: number

  @Expose({ name: 'recording_files' })
  @ValidateNested({ each: true })
  @Type(() => TranscriptFileInfoDto)
  recordingFiles: TranscriptFileInfoDto[]
}

export class TranscriptFileInfoDto {
  @IsString()
  id: string

  @Expose({ name: 'meeting_id' })
  @IsString()
  meetingId: string

  @Expose({ name: 'download_url' })
  @IsString()
  downloadUrl: string

  @Expose({ name: 'file_type' })
  @IsString()
  fileType: string

  @Expose({ name: 'file_extension' })
  @IsString()
  fileExtension: string
}