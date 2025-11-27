import { IsString, ValidateNested } from "class-validator";
import { ZoomEventBaseDto, ZoomEventBasePayloadDto } from "./event-base.dto";
import { Expose, Type } from "class-transformer";

export class ZoomUrlValidationEventDto extends ZoomEventBaseDto {

  declare event: 'endpoint.url_validation';

  @ValidateNested()
  @Type(() => ZoomUrlValidationPayloadDto)
  declare payload: ZoomUrlValidationPayloadDto;

}

export class ZoomUrlValidationPayloadDto extends ZoomEventBasePayloadDto {

  @IsString()
  declare plain_token: string;
}
