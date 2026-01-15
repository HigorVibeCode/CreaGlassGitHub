import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationsRepository } from '../../services/repositories/interfaces';
import { Notification } from '../../types';
import { triggerNotificationAlert } from '../../utils/notification-alert';

const STORAGE_KEY = 'mock_notifications';
const STORAGE_KEY_READS = 'mock_notification_reads';

interface NotificationRead {
  notificationId: string;
  userId: string;
  readAt: string;
}

export class MockNotificationsRepository implements NotificationsRepository {
  private async getNotifications(): Promise<Notification[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  }
  
  private async saveNotifications(notifications: Notification[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }
  
  private async getReads(): Promise<NotificationRead[]> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_READS);
    if (!stored) return [];
    return JSON.parse(stored);
  }
  
  private async saveReads(reads: NotificationRead[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY_READS, JSON.stringify(reads));
  }
  
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const notifications = await this.getNotifications();
    const reads = await this.getReads();
    const userReads = reads.filter(r => r.userId === userId);
    const readNotificationIds = new Set(userReads.map(r => r.notificationId));
    
    const userNotifications = notifications.filter(
      n => !n.targetUserId || n.targetUserId === userId
    );
    
    // Add readAt field based on user's reads
    return userNotifications.map(notification => ({
      ...notification,
      readAt: readNotificationIds.has(notification.id) 
        ? userReads.find(r => r.notificationId === notification.id)?.readAt 
        : undefined,
    }));
  }
  
  async getUnreadCount(userId: string): Promise<number> {
    const notifications = await this.getUserNotifications(userId);
    return notifications.filter(n => !n.readAt).length;
  }
  
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const reads = await this.getReads();
    const existing = reads.find(r => r.notificationId === notificationId && r.userId === userId);
    
    if (!existing) {
      const newRead: NotificationRead = {
        notificationId,
        userId,
        readAt: new Date().toISOString(),
      };
      reads.push(newRead);
      await this.saveReads(reads);
    }
  }
  
  async createNotification(
    notification: Omit<Notification, 'id' | 'createdAt'>
  ): Promise<Notification> {
    const notifications = await this.getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: 'notif-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    notifications.push(newNotification);
    await this.saveNotifications(notifications);
    
    // Trigger vibration and sound alert (não aguardamos o som terminar)
    triggerNotificationAlert().catch(err => {
      console.warn('Failed to trigger notification alert:', err);
    });
    
    return newNotification;
  }
  
  async clearUserNotifications(userId: string): Promise<void> {
    const reads = await this.getReads();
    // Remove all reads for this user (effectively clearing their notifications view)
    const filteredReads = reads.filter(r => r.userId !== userId);
    await this.saveReads(filteredReads);
    
    // Also remove notifications targeted to this specific user
    const notifications = await this.getNotifications();
    const filteredNotifications = notifications.filter(
      n => n.targetUserId && n.targetUserId !== userId
    );
    await this.saveNotifications(filteredNotifications);
  }
}
