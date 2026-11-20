import { IsNotEmpty, IsString } from 'class-validator';

export class CreateExploreCommentDto {
  @IsNotEmpty({ message: 'متن نظر نمی‌تواند خالی باشد' })
  @IsString({ message: 'متن نظر باید رشته باشد' })
  text!: string;
}
