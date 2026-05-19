export type NotificationType = "info" | "warning" | "success" | "error" | "system";

export interface ApiNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
  updated_at?: string;
  meta_data?: Record<string, any>;
}
