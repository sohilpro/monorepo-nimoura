import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketMessage } from './entities/ticket-message.entity';
import { Users } from 'src/modules/users/entities/users.entity';
import { TicketsService } from './tickets.service';
import { TicketsController } from './controllers/tickets.controller';
import { TicketsAdminController } from './controllers/tickets-admin.controller';
import { SmsService } from 'src/modules/payments/sms.service';
import { MediaModule } from 'src/modules/media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketMessage, Users]),
    MediaModule,
  ],
  controllers: [TicketsController, TicketsAdminController],
  providers: [TicketsService, SmsService],
  exports: [TicketsService],
})
export class TicketsModule {}
