import { Type } from 'class-transformer';
import { IsInt, Matches, Max, Min } from 'class-validator';

// نمونه‌ی ترب: 2025-09-21T10:00:00.000000Z  (UTC و با پسوند Z)
export const ISO_UTC_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/;

export class TorobOrdersQueryDto {
  @Matches(ISO_UTC_RE, {
    message:
      'purchase_timestamp_gt must be ISO 8601 UTC, e.g. 2025-09-21T10:00:00.000000Z',
  })
  purchase_timestamp_gt!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit!: number;
}