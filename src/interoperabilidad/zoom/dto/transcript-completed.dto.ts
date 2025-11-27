import { IsNumber, IsString, ValidateNested } from "class-validator";
import { ZoomEventBaseDto, ZoomEventBasePayloadDto } from "./event-base.dto";
import { Expose, Type } from "class-transformer";

export class TranscriptCompletedEventDto extends ZoomEventBaseDto {

  declare event: 'recording.transcript_completed';

  @ValidateNested()
  @Type(() => TranscriptCompletedPayloadDto)
  declare payload: TranscriptCompletedPayloadDto;

  @IsString()
  declare download_token: string;
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

  @ValidateNested({ each: true })
  @Type(() => TranscriptFileInfoDto)
  recording_files: TranscriptFileInfoDto[]
}

export class TranscriptFileInfoDto {
  @IsString()
  id: string

  @IsString()
  meeting_id: string

  @IsString()
  download_url: string

  @IsString()
  file_type: string

  @IsString()
  file_extension: string
}