import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class ZoomEventBasePayloadDto {
  @Expose()
  @IsOptional()
  object?: any;

  @Expose({ name: 'plain_token' })
  @IsOptional()
  @IsString()
  plainToken?: string;
}

export class ZoomEventBaseDto {
  @Expose()        // <-- ¡NECESARIO!
  @IsString()
  event: string;

  @Expose()
  @ValidateNested()
  @Type(() => ZoomEventBasePayloadDto)
  payload: ZoomEventBasePayloadDto;

  @Expose({ name: 'download_token' })
  @IsOptional()
  @IsString()
  downloadToken?: string;
}


