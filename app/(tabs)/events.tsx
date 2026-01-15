import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useI18n } from '../../src/hooks/use-i18n';
import { ScreenWrapper } from '../../src/components/shared/ScreenWrapper';
import { theme } from '../../src/theme';

export default function EventsScreen() {
  const { t } = useI18n();

  return (
    <ScreenWrapper>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{t('events.noData')}</Text>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
});
