export interface NotificationStats {
  total: number;

  // Thống kê theo trạng thái gửi
  byStatus: {
    pending: number;
    sent: number;
    failed: number;
  };

  // Thống kê theo kênh gửi
  byChannel: {
    email: number;
    sms: number;
    push: number;
    in_app: number;
    webhook: number;
  };

  // Thống kê theo khoảng thời gian gần đây
  recent: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
}
