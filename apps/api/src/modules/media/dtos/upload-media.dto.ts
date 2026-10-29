import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { MediaOwnerType } from '../enums/media-owner-type.enum';

export type SafeExtension =
  '.jpg' | '.jpeg' | '.png' | '.webp' | '.svg' | '.gif';

export class UploadMediaDto {
  @IsEnum(MediaOwnerType)
  ownerType: MediaOwnerType;

  @IsString()
  ownerId: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;
}

export class DeleteByOwnerDto {
  @IsEnum(MediaOwnerType)
  ownerType: MediaOwnerType;

  @IsString()
  ownerId: string;
}
