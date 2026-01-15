import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert, Linking, Modal, TouchableWithoutFeedback, Dimensions, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../src/hooks/use-i18n';
import { useAuth } from '../../src/store/auth-store';
import { usePermissions } from '../../src/hooks/use-permissions';
import { PermissionGuard } from '../../src/components/shared/PermissionGuard';
import { Button } from '../../src/components/shared/Button';
import { ScreenWrapper } from '../../src/components/shared/ScreenWrapper';
import { repos } from '../../src/services/container';
import { Document } from '../../src/types';
import { theme } from '../../src/theme';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

export default function DocumentsScreen() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const allDocuments = await repos.documentsRepo.getAllDocuments();
      setDocuments(allDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
      Alert.alert(t('common.error'), t('documents.uploadError'));
    }
  };

  const handleUpload = async () => {
    if (!user || !hasPermission('documents.upload')) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ALLOWED_MIME_TYPES,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      if (!ALLOWED_MIME_TYPES.includes(file.mimeType || '')) {
        Alert.alert(t('common.error'), t('documents.allowedTypes'));
        return;
      }

      setLoading(true);
      await repos.documentsRepo.uploadDocument(
        {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        },
        user.id
      );
      await loadDocuments();
      Alert.alert(t('common.success'), t('documents.upload') + ' ' + t('common.success'));
    } catch (error: any) {
      console.error('Error uploading document:', error);
      const errorMessage = error?.message || t('documents.uploadError');
      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (document: Document) => {
    try {
      // Obter a URL do documento
      const fileUri = await repos.documentsRepo.getDocumentUrl(document.id);
      let finalUri = fileUri;

      // Verificar se o arquivo existe e obter o URI correto
      if (fileUri.startsWith('file://') || fileUri.startsWith('content://')) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          if (!fileInfo.exists) {
            Alert.alert(t('common.error'), t('documents.downloadError'));
            return;
          }
        } catch (fileError) {
          // Se não conseguir verificar, tentar abrir mesmo assim
          console.warn('Could not verify file existence:', fileError);
        }
        finalUri = fileUri;
      } else if (!fileUri.startsWith('http://') && !fileUri.startsWith('https://')) {
        // Se não tem protocolo, adicionar file://
        finalUri = fileUri.startsWith('/') ? `file://${fileUri}` : `file:///${fileUri}`;
      }

      // Para imagens, usar visualizador de imagem em modal
      if (document.mimeType.startsWith('image/')) {
        setViewingImage(finalUri);
      } else {
        // Para PDFs e outros documentos, abrir no visualizador nativo
        const isLocalFile = finalUri.startsWith('file://') || finalUri.startsWith('content://');
        
        if (isLocalFile) {
          // Para arquivos locais, abrir no visualizador nativo
          try {
            // Android: usar IntentLauncher com content URI (mostra seletor de visualizadores)
            if (Platform.OS === 'android') {
              let contentUri = finalUri;
              
              // Garantir que o arquivo esteja em um diretório acessível para obter content URI válido
              // Tentar documentDirectory primeiro, depois cacheDirectory como fallback
              const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
              if (!docDir) {
                Alert.alert(t('common.error'), 'Unable to access file system. Please try again.');
                return;
              }
              
              const filename = document.filename || `document_${Date.now()}.pdf`;
              const docPath = docDir + filename;
              
              // Se o arquivo já não estiver no documentDirectory, copiar
              if (!finalUri.startsWith(docDir)) {
                try {
                  console.log('Copying file to documentDirectory:', finalUri, '->', docPath);
                  await FileSystem.copyAsync({
                    from: finalUri,
                    to: docPath,
                  });
                  finalUri = docPath;
                  console.log('File copied successfully');
                } catch (copyError: any) {
                  console.warn('Could not copy file to documentDirectory:', copyError);
                  // Tentar usar o URI original mesmo assim
                }
              } else {
                finalUri = docPath;
              }
              
              // Obter content URI
              try {
                // Método 1: Tentar usar getContentUriAsync (Expo SDK 50+)
                if (FileSystem.getContentUriAsync && typeof FileSystem.getContentUriAsync === 'function') {
                  contentUri = await FileSystem.getContentUriAsync(finalUri);
                  console.log('Using getContentUriAsync, content URI:', contentUri);
                } else {
                  // Para versões antigas, usar o finalUri do documentDirectory diretamente
                  // O Expo FileSystem pode lidar com isso internamente
                  contentUri = finalUri;
                  console.log('Using file URI from documentDirectory:', contentUri);
                }
              } catch (contentUriError: any) {
                console.warn('Could not get content URI:', contentUriError);
                // Usar o finalUri do documentDirectory como fallback
                contentUri = finalUri;
              }
              
              // Abrir com IntentLauncher usando ACTION_VIEW (mostra seletor de visualizadores)
              // Remover category para mostrar todos os apps que podem visualizar
              try {
                await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                  data: contentUri,
                  type: document.mimeType || 'application/pdf',
                  flags: 1, // FLAG_ACTIVITY_NEW_TASK
                });
                console.log('IntentLauncher succeeded - file opened');
              } catch (intentError: any) {
                console.error('Error opening with IntentLauncher:', intentError);
                
                if (intentError.message?.includes('No Activity found') || intentError.code === 'NO_ACTIVITY') {
                  Alert.alert(
                    t('common.error'), 
                    'No app found to open this file. Please install a PDF viewer app (e.g., Adobe Reader, Google Drive).'
                  );
                } else if (intentError.message?.includes('FileUriExposedException') || 
                          intentError.message?.includes('exposed beyond app')) {
                  Alert.alert(
                    t('common.error'), 
                    'Unable to open file due to Android security restrictions. Please try again or install a PDF viewer app.'
                  );
                } else {
                  Alert.alert(t('common.error'), intentError.message || t('documents.downloadError'));
                }
              }
            } else {
              // iOS - usar Linking
              const supported = await Linking.canOpenURL(finalUri);
              if (supported) {
                await Linking.openURL(finalUri);
              } else {
                Alert.alert(t('common.error'), t('documents.downloadError'));
              }
            }
          } catch (openError) {
            console.error('Error opening file:', openError);
            // Como último recurso, tentar usar Sharing
            try {
              const isAvailable = await Sharing.isAvailableAsync();
              if (isAvailable) {
                await Sharing.shareAsync(finalUri, {
                  mimeType: document.mimeType,
                  dialogTitle: document.filename,
                });
              } else {
                Alert.alert(t('common.error'), t('documents.downloadError'));
              }
            } catch (shareError) {
              console.error('Error sharing file:', shareError);
              Alert.alert(t('common.error'), t('documents.downloadError'));
            }
          }
        } else {
          // Para URLs remotas, usar Linking normalmente
          try {
            const supported = await Linking.canOpenURL(finalUri);
            if (supported) {
              await Linking.openURL(finalUri);
            } else {
              Alert.alert(t('common.error'), t('documents.downloadError'));
            }
          } catch (error) {
            console.error('Error opening URL:', error);
            Alert.alert(t('common.error'), t('documents.downloadError'));
          }
        }
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      Alert.alert(t('common.error'), t('documents.downloadError'));
    }
  };

  const handleDownload = async (document: Document) => {
    if (!user || !hasPermission('documents.download')) return;

    try {
      setDownloadingId(document.id);
      const fileUri = await repos.documentsRepo.getDocumentUrl(document.id);
      let finalUri = fileUri;

      // Verificar se o arquivo existe e obter o URI correto
      if (fileUri.startsWith('file://') || fileUri.startsWith('content://')) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          if (!fileInfo.exists) {
            Alert.alert(t('common.error'), t('documents.downloadError'));
            setDownloadingId(null);
            return;
          }
          finalUri = fileUri;
        } catch (fileError) {
          console.warn('Could not verify file existence:', fileError);
          // Tentar usar mesmo assim
          finalUri = fileUri;
        }
      } else if (fileUri.startsWith('http://') || fileUri.startsWith('https://')) {
        // Se for uma URL remota, baixar o arquivo primeiro
        try {
          const downloadDir = FileSystem.cacheDirectory + 'downloads/';
          const dirInfo = await FileSystem.getInfoAsync(downloadDir);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
          }
          
          const filename = document.filename || 'document';
          const downloadPath = downloadDir + filename;
          
          const downloadResult = await FileSystem.downloadAsync(fileUri, downloadPath);
          finalUri = downloadResult.uri;
        } catch (downloadError) {
          console.error('Error downloading remote file:', downloadError);
          Alert.alert(t('common.error'), t('documents.downloadError'));
          setDownloadingId(null);
          return;
        }
      } else {
        // Se não tem protocolo, adicionar file://
        finalUri = fileUri.startsWith('/') ? `file://${fileUri}` : `file:///${fileUri}`;
      }

      // Verificar se o Sharing está disponível
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        // Se sharing não estiver disponível, tentar abrir o arquivo
        try {
          const supported = await Linking.canOpenURL(finalUri);
          if (supported) {
            await Linking.openURL(finalUri);
            Alert.alert(t('common.success'), t('documents.download'));
          } else {
            Alert.alert(t('common.error'), t('documents.downloadError'));
          }
        } catch (openError) {
          console.error('Error opening file:', openError);
          Alert.alert(t('common.error'), t('documents.downloadError'));
        }
        setDownloadingId(null);
        return;
      }

      // Compartilhar/baixar o arquivo
      try {
        await Sharing.shareAsync(finalUri, {
          mimeType: document.mimeType,
          dialogTitle: t('documents.download'),
        });
      } catch (shareError) {
        console.error('Error sharing file:', shareError);
        // Se falhar ao compartilhar, tentar abrir diretamente
        try {
          const supported = await Linking.canOpenURL(finalUri);
          if (supported) {
            await Linking.openURL(finalUri);
          } else {
            Alert.alert(t('common.error'), t('documents.downloadError'));
          }
        } catch (openError) {
          console.error('Error opening file:', openError);
          Alert.alert(t('common.error'), t('documents.downloadError'));
        }
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      Alert.alert(t('common.error'), t('documents.downloadError'));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <PermissionGuard permission="documents.upload">
            <View style={styles.uploadButtonContainer}>
              <Button
                title={t('documents.upload')}
                onPress={handleUpload}
                loading={loading}
              />
            </View>
          </PermissionGuard>

          {documents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('documents.noDocuments')}</Text>
            </View>
          ) : (
            <View style={styles.documentsList}>
              {documents.map((doc) => (
                <View key={doc.id} style={styles.documentCard}>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentName}>{doc.filename}</Text>
                    <Text style={styles.documentMeta}>
                      {doc.mimeType} • {new Date(doc.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.documentActions}>
                    {hasPermission('documents.view') && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleView(doc)}
                      >
                        <Text style={styles.actionButtonText}>{t('documents.view')}</Text>
                      </TouchableOpacity>
                    )}
                    <PermissionGuard permission="documents.download">
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          styles.downloadButton,
                          downloadingId === doc.id && styles.downloadButtonDisabled,
                        ]}
                        onPress={() => handleDownload(doc)}
                        disabled={downloadingId === doc.id}
                      >
                        {downloadingId === doc.id ? (
                          <View style={styles.loadingContainer}>
                            <Text style={[styles.actionButtonText, styles.downloadButtonText]}>
                              {t('common.loading')}...
                            </Text>
                          </View>
                        ) : (
                          <Text style={[styles.actionButtonText, styles.downloadButtonText]}>
                            {t('documents.download')}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </PermissionGuard>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal para visualização de imagens */}
      <Modal
        visible={viewingImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setViewingImage(null)}
      >
        <TouchableWithoutFeedback onPress={() => setViewingImage(null)}>
          <View style={styles.imageModalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.imageModalContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setViewingImage(null)}
                >
                  <Ionicons name="close" size={28} color={theme.colors.text} />
                </TouchableOpacity>
                {viewingImage && (
                  <Image
                    source={{ uri: viewingImage }}
                    style={styles.imageViewer}
                    contentFit="contain"
                    transition={200}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  uploadButtonContainer: {
    marginBottom: theme.spacing.lg,
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  documentsList: {
    gap: theme.spacing.md,
  },
  documentCard: {
    backgroundColor: theme.colors.cardBackground,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  documentInfo: {
    marginBottom: theme.spacing.sm,
  },
  documentName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  documentMeta: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  documentActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  downloadButton: {
    backgroundColor: theme.colors.primary + '20',
  },
  actionButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
  },
  downloadButtonText: {
    color: theme.colors.primary,
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  imageViewer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});
