import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../src/hooks/use-i18n';
import { useAuth } from '../src/store/auth-store';
import { Button } from '../src/components/shared/Button';
import { repos } from '../src/services/container';
import { theme } from '../src/theme';
import { useThemeColors } from '../src/hooks/use-theme-colors';

const TIMER_SECONDS = 10;

export default function BloodPriorityScreen() {
  const { t } = useI18n();
  const { user } = useAuth();
  const colors = useThemeColors();
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [canConfirm, setCanConfirm] = useState(false);
  const [userReads, setUserReads] = useState<any[]>([]);

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedMessageId && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanConfirm(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedMessageId, timer]);

  const loadMessages = async () => {
    if (!user) return;
    try {
      const allMessages = await repos.bloodPriorityRepo.getAllMessages();
      setMessages(allMessages);
      const reads = await repos.bloodPriorityRepo.getUserReads(user.id);
      setUserReads(reads);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleOpenMessage = async (messageId: string) => {
    if (!user) return;
    setSelectedMessageId(messageId);
    setTimer(TIMER_SECONDS);
    setCanConfirm(false);
    try {
      await repos.bloodPriorityRepo.openMessage(messageId, user.id);
    } catch (error) {
      console.error('Error opening message:', error);
    }
  };

  const handleConfirmRead = async () => {
    if (!user || !selectedMessageId) return;
    try {
      await repos.bloodPriorityRepo.confirmRead(selectedMessageId, user.id);
      setSelectedMessageId(null);
      setCanConfirm(false);
      loadMessages();
    } catch (error) {
      console.error('Error confirming read:', error);
    }
  };

  const selectedMessage = messages.find((m) => m.id === selectedMessageId);
  
  const isMessageRead = (messageId: string): boolean => {
    const read = userReads.find(r => r.messageId === messageId && r.confirmedAt);
    return !!read;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('bloodPriority.noMessages')}</Text>
          </View>
        ) : (
          <View style={styles.messagesList}>
            {messages.map((message) => {
              const isRead = isMessageRead(message.id);
              return (
                <TouchableOpacity
                  key={message.id}
                  style={[
                    styles.messageCard,
                    { backgroundColor: colors.cardBackground },
                    isRead && styles.messageCardRead,
                  ]}
                  onPress={() => handleOpenMessage(message.id)}
                >
                  <View style={styles.messageHeader}>
                    <Text style={[styles.messageTitle, { color: colors.text }]}>{message.title}</Text>
                    {isRead && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {selectedMessage && (
          <View style={[styles.messageDetail, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.messageDetailTitle, { color: colors.text }]}>{selectedMessage.title}</Text>
            <Text style={[styles.messageDetailBody, { color: colors.text }]}>{selectedMessage.body}</Text>
            <View style={[styles.timerContainer, { backgroundColor: colors.warning + '20' }]}>
              <Text style={[styles.timerText, { color: colors.warning }]}>
                {t('bloodPriority.timerWarning', { seconds: timer })}
              </Text>
            </View>
            <Button
              title={t('bloodPriority.confirmRead')}
              onPress={handleConfirmRead}
              disabled={!canConfirm}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
  },
  messagesList: {
    gap: theme.spacing.md,
  },
  messageCard: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  messageCardRead: {
    opacity: 0.7,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    flex: 1,
  },
  messageBody: {
    fontSize: theme.typography.fontSize.md,
  },
  messageDetail: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.md,
  },
  messageDetailTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.md,
  },
  messageDetailBody: {
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.lg,
    lineHeight: theme.typography.lineHeight.md,
  },
  timerContainer: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  timerText: {
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
  },
});
