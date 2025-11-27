import { IsOptional, IsString, ValidateNested } from "class-validator";
import { ZoomEventBaseDto, ZoomEventBasePayloadDto } from "./event-base.dto";
import { Expose, Type } from "class-transformer";

export class SummaryCompletedEventDto extends ZoomEventBaseDto {
  declare event: 'meeting.summary_completed';

  @ValidateNested()
  @Type(() => SummaryCompletedPayloadDto)
  declare payload: SummaryCompletedPayloadDto;
}

export class SummaryCompletedPayloadDto extends ZoomEventBasePayloadDto {
  @ValidateNested()
  @Type(() => SummaryCompletedObjectDto)
  declare object: SummaryCompletedObjectDto;
}

export class SummaryCompletedObjectDto {

  @IsString()
  meeting_uuid: string

  @IsString()
  summary_title: string

  @IsOptional()
  @IsString()
  summary_content?: string
}