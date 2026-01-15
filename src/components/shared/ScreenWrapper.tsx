import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '../../hooks/use-theme-colors';

interface ScreenWrapperProps {
  children: React.ReactNode;
  showTopBar?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ 
  children, 
  showTopBar = true 
}) => {
  const colors = useThemeColors();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
