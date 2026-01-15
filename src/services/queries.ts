import { useQuery } from '@tanstack/react-query';
import { Permission, User, Notification } from '../types';
import { repos } from './container';

export const usePermissionsQuery = (userId?: string) => {
  return useQuery<Permission[]>({
    queryKey: ['permissions', userId],
    queryFn: async () => {
      if (!userId) return [];
      return repos.permissionsRepo.getUserPermissions(userId);
    },
    enabled: !!userId,
  });
};

export const useUsersQuery = () => {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => repos.usersRepo.getAllUsers(),
  });
};

export const useAllPermissionsQuery = () => {
  return useQuery<Permission[]>({
    queryKey: ['allPermissions'],
    queryFn: () => repos.permissionsRepo.getAllPermissions(),
  });
};

export const useNotificationsQuery = (userId?: string) => {
  return useQuery<Notification[]>({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      const notifications = await repos.notificationsRepo.getUserNotifications(userId);
      // Sort notifications by date: most recent first
      return notifications.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
    },
    enabled: !!userId,
    refetchInterval: 5000, // Refetch every 5 seconds as fallback
  });
};

export const useUnreadNotificationsCountQuery = (userId?: string) => {
  return useQuery<number>({
    queryKey: ['notifications', 'unreadCount', userId],
    queryFn: async () => {
      if (!userId) return 0;
      return repos.notificationsRepo.getUnreadCount(userId);
    },
    enabled: !!userId,
    refetchInterval: 5000, // Refetch every 5 seconds as fallback
  });
};
