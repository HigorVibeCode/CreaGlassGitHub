# 📱 Guia para Gerar Build iOS (.ipa)

Este projeto usa **EAS Build** (Expo Application Services) para gerar builds de iOS.

## 🚀 Pré-requisitos

1. **Conta Expo**: Você precisa estar logado no Expo
   ```bash
   npx eas login
   ```

2. **Conta Apple Developer**: Necessária para assinar o app iOS
   - Acesso gratuito para desenvolvimento (TestFlight/desenvolvimento)
   - Conta paga ($99/ano) para App Store

3. **EAS CLI**: Já está instalado como dependência (`eas-cli`)

## 📦 Gerar Build iOS

### ⚠️ Importante: iOS não usa APK

- **Android** usa `.apk` ou `.aab`
- **iOS** usa `.ipa` (iOS App Store Package)

### Opção 1: Build Preview (Recomendado para Teste)

```bash
npm run build:ios:preview
```

Ou diretamente:
```bash
npx eas build --platform ios --profile preview
```

**Perfil Preview:**
- Gera **.ipa** para distribuição interna
- Pode ser instalado via TestFlight ou ad-hoc
- Ideal para testes

### Opção 2: Build Production

```bash
npm run build:ios:production
```

Ou diretamente:
```bash
npx eas build --platform ios --profile production
```

**Perfil Production:**
- Gera **.ipa** para App Store
- Versão incrementada automaticamente
- Pronto para submissão na App Store

### Opção 3: Build Development (Com Development Client)

```bash
npm run build:ios:dev
```

Ou diretamente:
```bash
npx eas build --platform ios --profile development
```

**Perfil Development:**
- Build com development client
- Para desenvolvimento e debugging

## 📥 Download do .ipa

Após o build ser concluído:

1. O EAS vai exibir um link para download no terminal
2. Você também pode acessar: https://expo.dev/accounts/[seu-usuario]/projects/Crea2/builds
3. O arquivo `.ipa` estará disponível para download

## 🍎 Instalar no iOS

### Via TestFlight (Recomendado)

1. Após o build, vá para: https://expo.dev/accounts/[seu-usuario]/projects/Crea2/submissions
2. Envie o build para TestFlight
3. Adicione testadores via App Store Connect
4. Instale o TestFlight no iPhone
5. Abra o convite recebido por email

### Via Instalação Direta (Ad-Hoc)

1. Baixe o `.ipa`
2. Use **Apple Configurator** ou **Xcode** para instalar
3. Ou use serviços como **Diawi** ou **InstallOnAir** para distribuição

## 🔍 Verificar Builds

Para ver a lista de builds iOS:

```bash
npx eas build:list --platform ios
```

## ⚙️ Configuração de Credenciais

Na primeira vez, o EAS vai pedir credenciais da Apple:

- **Apple ID**: Seu email da Apple Developer
- **App-Specific Password**: Gerado em appleid.apple.com (se tiver 2FA)
- **Certificates e Provisioning Profiles**: EAS gerencia automaticamente

## 📝 Notas Importantes

- O build é feito na **nuvem** (EAS Build), não localmente
- É necessário estar logado no Expo
- O primeiro build pode demorar mais (~20-40 minutos)
- Builds subsequentes são mais rápidos
- Para distribuição via App Store, você precisa de uma conta Apple Developer paga ($99/ano)

## 🔐 Configuração de Assinatura

O EAS Build pode gerenciar automaticamente:
- Certificados de desenvolvimento
- Provisioning profiles
- Assinatura do app

Se necessário, configure manualmente em:
```
eas credentials
```

## 🆘 Solução de Problemas

### Erro: "Not logged in"
```bash
npx eas login
```

### Erro: "Apple credentials not found"
O EAS vai guiar você no processo de configuração. Execute:
```bash
npx eas build --platform ios
```
E siga as instruções.

### Erro: "No bundle identifier found"
Verifique o `app.json` ou `app.config.js` e configure:
```json
{
  "ios": {
    "bundleIdentifier": "com.suaempresa.creaglass"
  }
}
```

### Ver status do build
Acesse: https://expo.dev/accounts/[seu-usuario]/projects/Crea2/builds

## 📚 Referências

- **Documentação EAS Build iOS**: https://docs.expo.dev/build/introduction/
- **Apple Developer**: https://developer.apple.com/
- **TestFlight**: https://developer.apple.com/testflight/

## ⚡ Comandos Rápidos

```bash
# Build preview iOS
npm run build:ios:preview

# Build production iOS  
npm run build:ios:production

# Listar builds iOS
npx eas build:list --platform ios

# Ver status do build atual
npx eas build:list --platform ios --limit 1
```
