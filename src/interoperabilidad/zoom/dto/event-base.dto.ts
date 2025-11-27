import { IsString, IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class ZoomEventBasePayloadDto {
  @Expose()
  @IsOptional()
  object?: any;

  @IsOptional()
  @IsString()
  plain_token?: string;
}

export class ZoomEventBaseDto {

  @IsString()
  event: string;

  @Expose()
  @ValidateNested()
  @Type(() => ZoomEventBasePayloadDto)
  payload: ZoomEventBasePayloadDto;

  @IsOptional()
  @IsString()
  download_token?: string;

  @IsNumber()
  event_ts: number
}


