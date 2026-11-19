import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { TicketAttachmentItem } from '../entities/ticket-message.entity';

export class ReplyTicketDto {
  @IsString({ message: 'متن پاسخ باید رشته باشد' })
  @IsNotEmpty({ message: 'متن پاسخ نمی‌تواند خالی باشد' })
  @MinLength(2, { message: 'متن پاسخ باید حداقل ۲ کاراکتر باشد' })
  message!: string;

  @IsOptional()
  @IsArray({ message: 'فایل‌های ضمیمه باید آرایه باشند' })
  attachments?: TicketAttachmentItem[];
}
