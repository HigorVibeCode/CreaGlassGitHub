import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useThemeColors } from '../../hooks/use-theme-colors';
import { useI18n } from '../../hooks/use-i18n';

interface DatePickerProps {
  label: string;
  value: string;
  onSelect: (date: string) => void;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ label, value, onSelect, placeholder }) => {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const colors = useThemeColors();
  const [selectedDate, setSelectedDate] = useState<Date>(value ? new Date(value) : new Date());
  const [tempDate, setTempDate] = useState<Date>(selectedDate);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return placeholder || t('common.select');
    const date = new Date(dateString);
    return formatDate(date);
  };

  const handleConfirm = () => {
    setSelectedDate(tempDate);
    onSelect(formatDate(tempDate));
    setVisible(false);
  };

  const handleCancel = () => {
    setTempDate(selectedDate);
    setVisible(false);
  };

  const handleDayChange = (delta: number) => {
    const newDate = new Date(tempDate);
    newDate.setDate(newDate.getDate() + delta);
    setTempDate(newDate);
  };

  const handleMonthChange = (delta: number) => {
    const newDate = new Date(tempDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setTempDate(newDate);
  };

  const handleYearChange = (delta: number) => {
    const newDate = new Date(tempDate);
    newDate.setFullYear(newDate.getFullYear() + delta);
    setTempDate(newDate);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.datePicker, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
        onPress={() => {
          setTempDate(selectedDate);
          setVisible(true);
        }}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectedText, { color: value ? colors.text : colors.textTertiary }]}>
          {formatDisplayDate(value)}
        </Text>
        <Ionicons name="calendar" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <TouchableWithoutFeedback onPress={handleCancel}>
          <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{label}</Text>
                  <TouchableOpacity onPress={handleCancel}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.dateSelector}>
                  <View style={styles.dateSelectorRow}>
                    <TouchableOpacity
                      style={[styles.arrowButton, { backgroundColor: colors.backgroundSecondary }]}
                      onPress={() => handleYearChange(-1)}
                    >
                      <Ionicons name="chevron-back" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.dateValue, { color: colors.text }]}>{tempDate.getFullYear()}</Text>
                    <TouchableOpacity
                      style={[styles.arrowButton, { backgroundColor: colors.backgroundSecondary }]}
                      onPress={() => handleYearChange(1)}
                    >
                      <Ionicons name="chevron-forward" size={20} color={colors.text} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dateSelectorRow}>
                    <TouchableOpacity
                      style={[styles.arrowButton, { backgroundColor: colors.backgroundSecondary }]}
                      onPress={() => handleMonthChange(-1)}
                    >
                      <Ionicons name="chevron-back" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.dateValue, { color: colors.text }]}>
                      {tempDate.toLocaleDateString('en-US', { month: 'long' })}
                    </Text>
                    <TouchableOpacity
                      style={[styles.arrowButton, { backgroundColor: colors.backgroundSecondary }]}
                      onPress={() => handleMonthChange(1)}
                    >
                      <Ionicons name="chevron-forward" size={20} color={colors.text} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dateSelectorRow}>
                    <TouchableOpacity
                      style={[styles.arrowButton, { backgroundColor: colors.backgroundSecondary }]}
                      onPress={() => handleDayChange(-1)}
                    >
                      <Ionicons name="chevron-back" size={20} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.dateValue, { color: colors.text }]}>{tempDate.getDate()}</Text>
                    <TouchableOpacity
                      style={[styles.arrowButton, { backgroundColor: colors.backgroundSecondary }]}
                      onPress={() => handleDayChange(1)}
                    >
                      <Ionicons name="chevron-forward" size={20} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    style={[styles.footerButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={handleCancel}
                  >
                    <Text style={[styles.footerButtonText, { color: colors.text }]}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.footerButton, { backgroundColor: colors.primary }]}
                    onPress={handleConfirm}
                  >
                    <Text style={[styles.footerButtonText, { color: colors.textInverse }]}>{t('common.confirm')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
  },
  selectedText: {
    fontSize: theme.typography.fontSize.md,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    maxWidth: 400,
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  dateSelector: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateValue: {
    flex: 1,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
