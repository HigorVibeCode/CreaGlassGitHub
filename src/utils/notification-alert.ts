import { Platform, Vibration, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

// Cache para o som carregado
let notificationSound: Audio.Sound | null = null;

/**
 * Carrega o som de notificação uma vez e mantém em cache
 */
const loadNotificationSound = async (): Promise<Audio.Sound | null> => {
  if (notificationSound) {
    return notificationSound;
  }

  try {
    // Carregar arquivo de som customizado
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/notification.wav'),
      {
        shouldPlay: false, // Apenas carregar, não reproduzir ainda
        volume: 1.0, // Volume máximo
        isLooping: false, // Não repetir
      }
    );
    notificationSound = sound;
    return sound;
  } catch (error) {
    console.warn('Failed to load notification sound file:', error);
    // Fallback: retorna null para usar sons do sistema
    return null;
  }
};

/**
 * Reproduz um som de notificação
 */
const playNotificationSound = async () => {
  try {
    // Configurar modo de áudio para reproduzir mesmo no modo silencioso
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    const sound = await loadNotificationSound();
    
    if (sound) {
      // Reproduzir som customizado
      // Resetar a posição para o início antes de reproduzir
      await sound.setPositionAsync(0);
      await sound.playAsync();
      
      // Adicionar vibração junto com o som customizado para melhor feedback
      if (Platform.OS === 'ios') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (Platform.OS === 'android') {
        Vibration.vibrate(400);
      }
    } else {
      // Usar som do sistema através de Haptics (iOS) ou vibração (Android)
      // O sistema operacional já reproduz um som padrão junto com a vibração
      if (Platform.OS === 'ios') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (Platform.OS === 'android') {
        // No Android, a vibração geralmente vem com som do sistema
        Vibration.vibrate(400);
      }
    }
  } catch (error) {
    console.warn('Failed to play notification sound:', error);
    // Fallback para vibração básica
    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate(400);
      }
    } catch (vibError) {
      // Ignorar erros de vibração
    }
  }
};

/**
 * Limpa os recursos de áudio quando não forem mais necessários
 */
export const cleanupNotificationSound = async () => {
  if (notificationSound) {
    try {
      await notificationSound.unloadAsync();
      notificationSound = null;
    } catch (error) {
      console.warn('Failed to cleanup notification sound:', error);
    }
  }
};

/**
 * Triggers vibration and sound alert when a notification is created
 * Reproduz som customizado ou usa som do sistema como fallback
 * Optionally shows an alert dialog with the notification message
 */
export const triggerNotificationAlert = async (
  notificationType?: string,
  message?: string
) => {
  try {
    // Reproduzir som e vibração
    await playNotificationSound();
    
    // Show alert message if provided (for important notifications)
    if (message) {
      // Use setTimeout to avoid blocking the current operation
      setTimeout(() => {
        Alert.alert(
          'Nova Notificação',
          message,
          [{ text: 'OK' }],
          { cancelable: true }
        );
      }, 500);
    }
  } catch (error) {
    // Silently fail if vibration/haptics are not available
    console.warn('Failed to trigger notification alert:', error);
  }
};
