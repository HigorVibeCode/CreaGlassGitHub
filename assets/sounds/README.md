# Sons de Notificação

Esta pasta contém os arquivos de áudio usados para notificações no app.

## Arquivo atual

O app está configurado para usar o arquivo `notification.wav` que deve estar nesta pasta.

## Como alterar o som

1. Substitua o arquivo `notification.wav` por outro arquivo com o mesmo nome, OU
2. Para usar outro formato ou nome de arquivo, edite `src/utils/notification-alert.ts` e altere a linha:

```typescript
require('../../assets/sounds/notification.wav')
```

## Formatos suportados

- `.wav` (atual)
- `.mp3` (também funciona bem)
- `.m4a` (iOS)
- `.aac` (iOS)

## Notas

- O som será reproduzido quando uma nova notificação for recebida via Realtime
- O som será reproduzido mesmo no modo silencioso no iOS (`playsInSilentModeIOS: true`)
- O som é carregado uma vez e mantido em cache para melhor performance
- Se o arquivo não for encontrado ou houver erro, o sistema usará os sons padrão do sistema operacional como fallback
