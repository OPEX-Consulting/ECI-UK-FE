import api from "@/lib/api";
import type { ApiNotification } from "@/types/notification";

/** List all notifications for the admin. */
export const getNotifications = async (): Promise<ApiNotification[]> => {
  const response = await api.get<ApiNotification[]>("/admin/notifications/");
  return response.data;
};

/** Clear all notifications. */
export const clearAllNotifications = async (): Promise<void> => {
  await api.delete("/admin/notifications/");
};

/** Fetch details for a single notification. */
export const getNotificationDetail = async (id: string): Promise<ApiNotification> => {
  const response = await api.get<ApiNotification>(`/admin/notifications/${id}`);
  return response.data;
};

/** Delete a single notification by ID. */
export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/admin/notifications/${id}`);
};

/** Mark all notifications as read. */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.patch("/admin/notifications/read-all");
};
