import { IsEnum, IsOptional } from 'class-validator';
import { TicketStatus } from '../enums/ticket-status.enum';
import { TicketPriority } from '../enums/ticket-priority.enum';
import { TicketDepartment } from '../enums/ticket-department.enum';

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus, { message: 'وضعیت انتخاب‌شده نامعتبر است' })
  status!: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority, { message: 'اولویت انتخاب‌شده نامعتبر است' })
  priority?: TicketPriority;

  @IsOptional()
  @IsEnum(TicketDepartment, { message: 'دپارتمان انتخاب‌شده نامعتبر است' })
  department?: TicketDepartment;
}
