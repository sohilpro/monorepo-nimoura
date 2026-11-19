import {
  TicketDepartment,
  TicketPriority,
  TicketSenderRole,
  TicketStatus,
} from './enums.js';

export interface TicketAttachment {
  url: string;
  name: string;
  size?: number;
  type?: string;
}

export interface TicketMessage {
  id: number;
  ticketId: number;
  senderId: number;
  senderRole: TicketSenderRole;
  message: string;
  attachments?: TicketAttachment[];
  isInternalNote?: boolean;
  createdAt: string;
  updatedAt?: string;
  senderName?: string;
}

export interface TicketCustomerInfo {
  id: number;
  first_name?: string;
  last_name?: string;
  mobile?: string;
  email?: string;
  created_at?: string;
  orders_count?: number;
}

export interface TicketOrderInfo {
  id: number;
  order_number?: string;
  total_price?: number;
  status?: string;
  created_at?: string;
}

export interface Ticket {
  id: number;
  trackingCode: string;
  userId: number;
  orderId?: number | null;
  title: string;
  department: TicketDepartment;
  priority: TicketPriority;
  status: TicketStatus;
  lastReplyAt: string;
  lastReplyBy: TicketSenderRole | 'system';
  unreadUserCount: number;
  unreadAdminCount: number;
  createdAt: string;
  updatedAt: string;
  messages?: TicketMessage[];
  user?: TicketCustomerInfo;
  order?: TicketOrderInfo;
  latestMessage?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  waitingUser: number;
  closed: number;
  today: number;
}

export interface TicketFilterQuery {
  page?: number;
  limit?: number;
  status?: TicketStatus | string;
  priority?: TicketPriority | string;
  department?: TicketDepartment | string;
  search?: string;
}

export interface CreateTicketPayload {
  title: string;
  department: TicketDepartment;
  priority?: TicketPriority;
  orderId?: number | null;
  message: string;
  attachments?: TicketAttachment[];
}

export interface ReplyTicketPayload {
  message: string;
  attachments?: TicketAttachment[];
}

export interface UpdateTicketStatusPayload {
  status: TicketStatus;
  priority?: TicketPriority;
  department?: TicketDepartment;
}
