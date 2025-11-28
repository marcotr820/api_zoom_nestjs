import { IsString } from "class-validator";

export class TokenS2SResponseDto {
  @IsString()
  access_token: string
}