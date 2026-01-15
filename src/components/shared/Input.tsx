import React from 'react';
import { TextInput, StyleSheet, View, Text, ViewStyle, TextInputProps } from 'react-native';
import { theme } from '../../theme';
import { useThemeColors } from '../../hooks/use-theme-colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  ...props
}) => {
  const colors = useThemeColors();
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          {
            borderColor: error ? colors.error : colors.border,
            color: colors.text,
            backgroundColor: colors.background,
          },
          style
        ]}
        placeholderTextColor={colors.textTertiary}
        {...props}
      />
      {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
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
  input: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
});
