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

  @Expose({ name: 'meeting_uuid' })
  @IsString()
  meetingUuid: string

  @Expose({ name: 'summary_title' })
  @IsString()
  summaryTitle: string

  @Expose({ name: 'summary_content' })
  @IsOptional()
  @IsString()
  summaryContent?: string
}