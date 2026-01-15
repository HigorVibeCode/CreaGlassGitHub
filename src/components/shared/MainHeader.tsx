import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../store/auth-store';
import { repos } from '../../services/container';
import { theme } from '../../theme';
import { usePermissions } from '../../hooks/use-permissions';

interface MainHeaderProps {
  title: string;
}

export const MainHeader: React.FC<MainHeaderProps> = ({ title }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [bloodPriorityUnread, setBloodPriorityUnread] = React.useState(0);

  React.useEffect(() => {
    loadCounts();
    const interval = setInterval(loadCounts, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [user]);

  const loadCounts = async () => {
    if (!user) return;
    try {
      const notifCount = await repos.notificationsRepo.getUnreadCount(user.id);
      setUnreadCount(notifCount);

      if (hasPermission('bloodPriority.view')) {
        const unreadMessages = await repos.bloodPriorityRepo.getUnreadMessages(user.id);
        setBloodPriorityUnread(unreadMessages.length);
      }
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        {/* Title can be added here if needed */}
      </View>
      <View style={styles.iconsContainer}>
        {hasPermission('bloodPriority.view') && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/blood-priority')}
            activeOpacity={0.7}
          >
            <View style={[styles.circularIcon, bloodPriorityUnread > 0 && styles.blinkingIcon]}>
              <Ionicons name="water" size={20} color={theme.colors.error} />
            </View>
            {bloodPriorityUnread > 0 && (
              <View style={styles.badge}>
                <View style={styles.badgeDot} />
              </View>
            )}
          </TouchableOpacity>
        )}
        {hasPermission('notifications.view') && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <View style={styles.badgeDot} />
              </View>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push('/profile')}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  titleContainer: {
    flex: 1,
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconButton: {
    position: 'relative',
    padding: theme.spacing.xs,
  },
  circularIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.error,
  },
  blinkingIcon: {
    // Animation will be handled by a blinking effect
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
});
