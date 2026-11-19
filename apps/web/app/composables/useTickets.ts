import {
  TicketDepartment,
  TicketPriority,
  TicketStatus,
  type CreateTicketPayload,
  type ReplyTicketPayload,
  type Ticket,
  type TicketAttachment,
  type TicketMessage,
} from '@nimoura/shared-types';

/**
 * کمکی برای استخراج امن دیتا از پاسخ سرور که با اینترسپتور به صورت { success: true, data: ... } می‌آید
 */
function unwrapResponse<T = any>(res: any): T {
  if (res && typeof res === 'object' && 'data' in res) {
    return res.data as T;
  }
  return res as T;
}

export const useTickets = () => {
  const tickets = useState<Ticket[]>('user_tickets', () => []);
  const total = useState<number>('user_tickets_total', () => 0);
  const currentTicket = useState<Ticket | null>('user_current_ticket', () => null);
  const pending = useState<boolean>('user_tickets_pending', () => false);
  const chatPending = useState<boolean>('user_ticket_chat_pending', () => false);
  const sending = useState<boolean>('user_ticket_sending', () => false);
  const uploading = useState<boolean>('user_ticket_uploading', () => false);

  const fetchTickets = async (params: { page?: number; limit?: number; status?: string; department?: string; search?: string } = {}) => {
    pending.value = true;
    try {
      const res = await $fetch<any>('/api/tickets', {
        query: params,
      });
      const data = unwrapResponse(res);
      const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      tickets.value = items;
      total.value = typeof data?.total === 'number' ? data.total : items.length;
      return data;
    } catch (err) {
      console.error('Failed to fetch user tickets:', err);
      return { items: [], total: 0 };
    } finally {
      pending.value = false;
    }
  };

  const fetchTicketById = async (id: number, silent = false) => {
    if (!silent) chatPending.value = true;
    try {
      const res = await $fetch<any>(`/api/tickets/${id}`);
      const data = unwrapResponse<Ticket>(res);
      currentTicket.value = data;
      // به‌روزرسانی در لیست تیکت‌ها در صورت وجود
      const idx = tickets.value.findIndex((t) => t.id === id);
      if (idx !== -1) {
        tickets.value[idx] = { ...tickets.value[idx], ...data };
      }
      return data;
    } catch (err) {
      console.error('Failed to fetch ticket by id:', err);
      throw err;
    } finally {
      if (!silent) chatPending.value = false;
    }
  };

  const createTicket = async (payload: CreateTicketPayload) => {
    sending.value = true;
    try {
      const res = await $fetch<any>('/api/tickets', {
        method: 'POST',
        body: payload,
      });
      const data = unwrapResponse<Ticket>(res);
      tickets.value.unshift(data);
      total.value += 1;
      currentTicket.value = data;
      return data;
    } finally {
      sending.value = false;
    }
  };

  const replyTicket = async (ticketId: number, payload: ReplyTicketPayload) => {
    sending.value = true;
    try {
      const res = await $fetch<any>(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        body: payload,
      });
      const newMsg = unwrapResponse<TicketMessage>(res);

      if (currentTicket.value && currentTicket.value.id === ticketId) {
        if (!currentTicket.value.messages) currentTicket.value.messages = [];
        currentTicket.value.messages.push(newMsg);
        currentTicket.value.status = TicketStatus.OPEN;
        currentTicket.value.lastReplyAt = new Date().toISOString();
      }

      // به‌روزرسانی در لیست محلی
      const idx = tickets.value.findIndex((t) => t.id === ticketId);
      if (idx !== -1) {
        tickets.value[idx].status = TicketStatus.OPEN;
        tickets.value[idx].latestMessage = payload.message;
        tickets.value[idx].lastReplyAt = new Date().toISOString();
      }

      return newMsg;
    } finally {
      sending.value = false;
    }
  };

  const closeTicket = async (ticketId: number) => {
    try {
      const res = await $fetch<any>(`/api/tickets/${ticketId}/close`, {
        method: 'PATCH',
      });
      const data = unwrapResponse<Ticket>(res);
      if (currentTicket.value && currentTicket.value.id === ticketId) {
        currentTicket.value.status = TicketStatus.CLOSED;
      }
      const idx = tickets.value.findIndex((t) => t.id === ticketId);
      if (idx !== -1) {
        tickets.value[idx].status = TicketStatus.CLOSED;
      }
      return data;
    } catch (err) {
      console.error('Failed to close ticket:', err);
      throw err;
    }
  };

  const uploadAttachment = async (file: File): Promise<TicketAttachment> => {
    uploading.value = true;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await $fetch<any>('/api/tickets/upload', {
        method: 'POST',
        body: formData,
      });
      return unwrapResponse<TicketAttachment>(res);
    } finally {
      uploading.value = false;
    }
  };

  // ─── فرمت‌دهنده‌ها و برچسب‌ها ───
  const getStatusBadge = (status: TicketStatus | string) => {
    switch (status) {
      case TicketStatus.OPEN:
        return {
          label: 'در انتظار پاسخ',
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          dot: 'bg-amber-500',
          icon: 'pi-clock',
        };
      case TicketStatus.IN_PROGRESS:
        return {
          label: 'در حال بررسی',
          color: 'text-sky-700 bg-sky-50 border-sky-200',
          dot: 'bg-sky-500',
          icon: 'pi-spin pi-spinner',
        };
      case TicketStatus.WAITING_USER:
        return {
          label: 'پاسخ پشتیبانی داده شد',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: 'pi-check-circle',
        };
      case TicketStatus.RESOLVED:
        return {
          label: 'حل شده',
          color: 'text-purple-700 bg-purple-50 border-purple-200',
          dot: 'bg-purple-500',
          icon: 'pi-check',
        };
      case TicketStatus.CLOSED:
      default:
        return {
          label: 'بسته شده',
          color: 'text-gray-600 bg-gray-100 border-gray-200',
          dot: 'bg-gray-400',
          icon: 'pi-lock',
        };
    }
  };

  const getDepartmentLabel = (dep: TicketDepartment | string) => {
    switch (dep) {
      case TicketDepartment.ORDERS:
        return 'سفارشات و ارسال';
      case TicketDepartment.FINANCIAL:
        return 'امور مالی و پرداخت';
      case TicketDepartment.TECHNICAL:
        return 'پشتیبانی فنی';
      case TicketDepartment.SALES:
        return 'مشاوره خرید و فروش';
      case TicketDepartment.GENERAL:
      default:
        return 'عمومی و پیشنهادات';
    }
  };

  const getPriorityBadge = (priority: TicketPriority | string) => {
    switch (priority) {
      case TicketPriority.URGENT:
        return { label: 'فوری', color: 'text-rose-700 bg-rose-50 border-rose-200' };
      case TicketPriority.HIGH:
        return { label: 'زیاد', color: 'text-orange-700 bg-orange-50 border-orange-200' };
      case TicketPriority.LOW:
        return { label: 'کم', color: 'text-gray-600 bg-gray-50 border-gray-200' };
      case TicketPriority.MEDIUM:
      default:
        return { label: 'متوسط', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    }
  };

  return {
    tickets,
    total,
    currentTicket,
    pending,
    chatPending,
    sending,
    uploading,
    fetchTickets,
    fetchTicketById,
    createTicket,
    replyTicket,
    closeTicket,
    uploadAttachment,
    getStatusBadge,
    getDepartmentLabel,
    getPriorityBadge,
  };
};
