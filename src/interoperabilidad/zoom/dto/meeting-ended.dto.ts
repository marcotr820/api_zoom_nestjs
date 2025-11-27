import { IsNumber, IsString, ValidateNested } from "class-validator";
import { ZoomEventBaseDto, ZoomEventBasePayloadDto } from "./event-base.dto";
import { Expose, Type } from "class-transformer";

export class MeetingEndedEventDto extends ZoomEventBaseDto {
  declare event: 'meeting.ended';

  @ValidateNested()
  @Type(() => MeetingEndedPayloadDto)
  declare payload: MeetingEndedPayloadDto;

}

export class MeetingEndedPayloadDto extends ZoomEventBasePayloadDto {
  @ValidateNested()
  @Type(() => MeetingEndedObjectDto)
  declare object: MeetingEndedObjectDto;
}

export class MeetingEndedObjectDto {

  @IsString()
  uuid: string;

  @IsNumber()
  duration: number;

  @Expose({ name: 'start_time' })
  @IsString()
  startTime: string;

  @Expose({ name: 'end_time' })
  @IsString()
  endTime: string;
  
}