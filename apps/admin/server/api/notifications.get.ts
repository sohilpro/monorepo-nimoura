export default defineEventHandler(async (event) => {
  const notifications: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    icon: string;
    badgeClass: string;
    iconBg: string;
    href: string;
    time: string;
    unread: boolean;
  }> = [];

  let totalUnread = 0;

  try {
    const [ticketStatsRes, pendingCommentsRes, paidOrdersRes] =
      await Promise.allSettled([
        adminApiFetch<any>(event, '/tickets/stats', { method: 'GET' }),
        adminApiFetch<any>(event, '/comments', {
          method: 'GET',
          query: { limit: 1, status: 'pending' },
        }),
        adminApiFetch<any>(event, '/orders', {
          method: 'GET',
          query: { limit: 1, status: 'paid' },
        }),
      ]);

    // ۱. بررسی تیکت‌ها
    if (ticketStatsRes.status === 'fulfilled') {
      const stats = ticketStatsRes.value?.data ?? ticketStatsRes.value;
      const unreadTickets = Number(stats?.unreadAdminCount ?? stats?.open ?? 0);
      if (unreadTickets > 0) {
        totalUnread += unreadTickets;
        notifications.push({
          id: 'tickets-pending',
          title: 'تیکت‌های در انتظار پاسخ',
          description: `${unreadTickets} تیکت پشتیبانی جدید منتظر پاسخگویی است.`,
          category: 'پشتیبانی',
          icon: 'pi pi-ticket',
          badgeClass: 'bg-amber-100 text-amber-800',
          iconBg: 'bg-amber-500 text-white',
          href: '/tickets',
          time: 'نیازمند اقدام',
          unread: true,
        });
      }
    }

    // ۲. بررسی دیدگاه‌های در انتظار تایید
    if (pendingCommentsRes.status === 'fulfilled') {
      const commentsData =
        pendingCommentsRes.value?.data ?? pendingCommentsRes.value;
      const pendingComments = Number(commentsData?.total ?? 0);
      if (pendingComments > 0) {
        totalUnread += pendingComments;
        notifications.push({
          id: 'comments-pending',
          title: 'دیدگاه‌های در انتظار تایید',
          description: `${pendingComments} دیدگاه جدید برای بررسی و تایید ثبت شده است.`,
          category: 'نظرات',
          icon: 'pi pi-comments',
          badgeClass: 'bg-blue-100 text-blue-800',
          iconBg: 'bg-blue-500 text-white',
          href: '/comments/reject',
          time: 'نیازمند اقدام',
          unread: true,
        });
      }
    }

    // ۳. بررسی سفارشات پرداخت‌شده منتظر ارسال
    if (paidOrdersRes.status === 'fulfilled') {
      const ordersData = paidOrdersRes.value?.data ?? paidOrdersRes.value;
      const pendingOrders = Number(
        ordersData?.total ?? ordersData?.orders?.length ?? 0,
      );
      if (pendingOrders > 0) {
        totalUnread += pendingOrders;
        notifications.push({
          id: 'orders-pending-send',
          title: 'سفارشات ارسال‌نشده',
          description: `${pendingOrders} سفارش پرداخت شده در صف ارسال قرار دارد.`,
          category: 'سفارشات',
          icon: 'pi pi-truck',
          badgeClass: 'bg-emerald-100 text-emerald-800',
          iconBg: 'bg-emerald-500 text-white',
          href: '/order/no-sending',
          time: 'فوری',
          unread: true,
        });
      }
    }
  } catch {
    // در صورت بروز هرگونه خطا، نوتیفیکیشن‌های حداقلی برگردانده می‌شوند
  }

  return {
    success: true,
    data: {
      unreadCount: totalUnread,
      items: notifications,
    },
  };
});
