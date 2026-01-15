import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useI18n } from '../../src/hooks/use-i18n';
import { ScreenWrapper } from '../../src/components/shared/ScreenWrapper';
import { repos } from '../../src/services/container';
import { InventoryGroup } from '../../src/types';
import { theme } from '../../src/theme';
import { useThemeColors } from '../../src/hooks/use-theme-colors';

export default function InventoryScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const colors = useThemeColors();
  const [groups, setGroups] = useState<InventoryGroup[]>([]);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const allGroups = await repos.inventoryRepo.getAllGroups();
      setGroups(allGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const handleGroupPress = (groupId: string) => {
    router.push({
      pathname: '/inventory-group',
      params: { groupId },
    });
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('inventory.groups')}</Text>
            
            {groups.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('inventory.noGroups')}</Text>
            ) : (
              <View style={styles.groupsList}>
                {groups.map((group) => (
                  <TouchableOpacity
                    key={group.id}
                    style={[styles.groupCard, { backgroundColor: colors.cardBackground }]}
                    onPress={() => handleGroupPress(group.id)}
                  >
                    <Text style={[styles.groupName, { color: colors.text }]}>{group.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
  groupsList: {
    gap: theme.spacing.md,
  },
  groupCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  groupName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
