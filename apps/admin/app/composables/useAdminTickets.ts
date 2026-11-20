import {
  TicketDepartment,
  TicketPriority,
  TicketStatus,
  type ReplyTicketPayload,
  type Ticket,
  type TicketAttachment,
  type TicketMessage,
  type TicketStats,
  type UpdateTicketStatusPayload,
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

export const useAdminTickets = () => {
  const tickets = useState<Ticket[]>('admin_tickets', () => []);
  const total = useState<number>('admin_tickets_total', () => 0);
  const stats = useState<TicketStats>('admin_tickets_stats', () => ({
    total: 0,
    open: 0,
    inProgress: 0,
    waitingUser: 0,
    closed: 0,
    today: 0,
  }));
  const activeTicket = useState<Ticket | null>('admin_active_ticket', () => null);
  const pending = useState<boolean>('admin_tickets_pending', () => false);
  const chatPending = useState<boolean>('admin_ticket_chat_pending', () => false);
  const sending = useState<boolean>('admin_ticket_sending', () => false);
  const uploading = useState<boolean>('admin_ticket_uploading', () => false);

  const fetchStats = async () => {
    try {
      const res = await $fetch<any>('/api/tickets/stats');
      const data = unwrapResponse<TicketStats>(res);
      if (data) {
        stats.value = {
          total: Number(data.total ?? 0),
          open: Number(data.open ?? 0),
          inProgress: Number(data.inProgress ?? 0),
          waitingUser: Number(data.waitingUser ?? 0),
          closed: Number(data.closed ?? 0),
          today: Number(data.today ?? 0),
        };
      }
      return stats.value;
    } catch (err) {
      console.error('Failed to fetch admin ticket stats:', err);
    }
  };

  const fetchTickets = async (params: { page?: number; limit?: number; status?: string; department?: string; priority?: string; search?: string } = {}) => {
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
      console.error('Failed to fetch admin tickets:', err);
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
      activeTicket.value = data;
      // به‌روزرسانی نشانگرهای خوانده‌نشده در لیست
      const idx = tickets.value.findIndex((t) => t.id === id);
      if (idx !== -1) {
        tickets.value[idx] = { ...tickets.value[idx], ...data, unreadAdminCount: 0 };
      }
      return data;
    } catch (err) {
      console.error('Failed to fetch admin ticket by id:', err);
      throw err;
    } finally {
      if (!silent) chatPending.value = false;
    }
  };

  const replyAdmin = async (ticketId: number, payload: ReplyTicketPayload) => {
    sending.value = true;
    try {
      const res = await $fetch<any>(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        body: payload,
      });
      const newMsg = unwrapResponse<TicketMessage>(res);

      if (activeTicket.value && activeTicket.value.id === ticketId) {
        if (!activeTicket.value.messages) activeTicket.value.messages = [];
        activeTicket.value.messages.push(newMsg);
        activeTicket.value.status = TicketStatus.WAITING_USER;
        activeTicket.value.lastReplyAt = new Date().toISOString();
      }

      const idx = tickets.value.findIndex((t) => t.id === ticketId);
      if (idx !== -1) {
        tickets.value[idx].status = TicketStatus.WAITING_USER;
        tickets.value[idx].latestMessage = payload.message;
        tickets.value[idx].lastReplyAt = new Date().toISOString();
      }

      // به‌روزرسانی آمار سریع
      fetchStats();
      return newMsg;
    } finally {
      sending.value = false;
    }
  };

  const updateTicketStatus = async (ticketId: number, payload: UpdateTicketStatusPayload) => {
    try {
      const res = await $fetch<any>(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        body: payload,
      });
      const updated = unwrapResponse<Ticket>(res);

      if (activeTicket.value && activeTicket.value.id === ticketId) {
        activeTicket.value.status = updated.status;
        if (updated.priority) activeTicket.value.priority = updated.priority;
        if (updated.department) activeTicket.value.department = updated.department;
      }

      const idx = tickets.value.findIndex((t) => t.id === ticketId);
      if (idx !== -1) {
        tickets.value[idx].status = updated.status;
        if (updated.priority) tickets.value[idx].priority = updated.priority;
        if (updated.department) tickets.value[idx].department = updated.department;
      }

      fetchStats();
      return updated;
    } catch (err) {
      console.error('Failed to update ticket status:', err);
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

  const getStatusBadge = (status: TicketStatus | string) => {
    switch (status) {
      case TicketStatus.OPEN:
        return {
          label: 'در انتظار پاسخ',
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          dot: 'bg-amber-500',
        };
      case TicketStatus.IN_PROGRESS:
        return {
          label: 'در حال بررسی',
          color: 'text-sky-700 bg-sky-50 border-sky-200',
          dot: 'bg-sky-500',
        };
      case TicketStatus.WAITING_USER:
        return {
          label: 'در انتظار پاسخ کاربر',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case TicketStatus.RESOLVED:
        return {
          label: 'حل شده',
          color: 'text-purple-700 bg-purple-50 border-purple-200',
          dot: 'bg-purple-500',
        };
      case TicketStatus.CLOSED:
      default:
        return {
          label: 'بسته شده',
          color: 'text-gray-600 bg-gray-100 border-gray-200',
          dot: 'bg-gray-400',
        };
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

  const deleteTicket = async (ticketId: number) => {
    try {
      const res = await $fetch<any>(`/api/tickets/${ticketId}`, {
        method: 'DELETE',
      });
      tickets.value = tickets.value.filter((t) => t.id !== ticketId);
      if (activeTicket.value?.id === ticketId) {
        activeTicket.value = null;
      }
      total.value = Math.max(0, total.value - 1);
      fetchStats().catch(() => null);
      return res;
    } catch (err: any) {
      console.error('Failed to delete ticket:', err);
      throw err;
    }
  };

  return {
    tickets,
    total,
    stats,
    activeTicket,
    pending,
    chatPending,
    sending,
    uploading,
    fetchStats,
    fetchTickets,
    fetchTicketById,
    replyAdmin,
    updateTicketStatus,
    uploadAttachment,
    deleteTicket,
    getStatusBadge,
    getPriorityBadge,
    getDepartmentLabel,
  };
};
