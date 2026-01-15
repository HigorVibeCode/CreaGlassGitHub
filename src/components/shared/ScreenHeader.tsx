import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface ScreenHeaderProps {
  title: string;
  rightIcons?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    badge?: number;
    blinking?: boolean;
  }[];
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, rightIcons = [] }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.iconsContainer}>
        {rightIcons.map((iconConfig, index) => (
          <TouchableOpacity
            key={index}
            onPress={iconConfig.onPress}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={iconConfig.icon}
              size={24}
              color={theme.colors.text}
            />
            {iconConfig.badge !== undefined && iconConfig.badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{iconConfig.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
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
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
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
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: theme.colors.textInverse,
    fontSize: 10,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
