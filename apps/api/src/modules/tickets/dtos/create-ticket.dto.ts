import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TicketDepartment } from '../enums/ticket-department.enum';
import { TicketPriority } from '../enums/ticket-priority.enum';
import { TicketAttachmentItem } from '../entities/ticket-message.entity';

export class CreateTicketDto {
  @IsString({ message: 'موضوع تیکت باید متنی باشد' })
  @IsNotEmpty({ message: 'موضوع تیکت الزامی است' })
  @MinLength(3, { message: 'موضوع تیکت باید حداقل ۳ کاراکتر باشد' })
  @MaxLength(200, { message: 'موضوع تیکت حداکثر می‌تواند ۲۰۰ کاراکتر باشد' })
  title!: string;

  @IsEnum(TicketDepartment, { message: 'دپارتمان انتخاب‌شده نامعتبر است' })
  department!: TicketDepartment;

  @IsOptional()
  @IsEnum(TicketPriority, { message: 'اولویت انتخاب‌شده نامعتبر است' })
  priority?: TicketPriority;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'شناسه سفارش نامعتبر است' })
  orderId?: number | null;

  @IsString({ message: 'متن پیام باید رشته باشد' })
  @IsNotEmpty({ message: 'متن پیام نمی‌تواند خالی باشد' })
  @MinLength(5, { message: 'متن پیام باید حداقل ۵ کاراکتر باشد' })
  message!: string;

  @IsOptional()
  @IsArray({ message: 'فایل‌های ضمیمه باید آرایه باشند' })
  attachments?: TicketAttachmentItem[];
}
