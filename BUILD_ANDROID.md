# 📱 Guia de Build Android para Download

Este guia explica como criar uma build Android (APK/AAB) para download e distribuição.

## 📋 Pré-requisitos

1. **Conta Expo/EAS**
   - Crie uma conta gratuita em: https://expo.dev/signup
   - O projeto já está configurado com o EAS (`projectId` no `app.json`)

2. **EAS CLI instalado**
   - Já está nas dependências do projeto
   - Se necessário, instale globalmente: `npm install -g eas-cli`

3. **Login no EAS**
   ```bash
   eas login
   ```

## 🚀 Passo a Passo

### 1. Fazer Login no EAS

```bash
npx eas login
```

Você será redirecionado para o navegador para fazer login com sua conta Expo.

**Importante:** Use sempre `npx eas` ao invés de apenas `eas`, pois o CLI não está instalado globalmente.

### 2. Verificar Configuração do Projeto

O projeto já está configurado com:
- ✅ `eas.json` com perfis de build
- ✅ `app.json` com `projectId` do EAS
- ✅ Configuração Android com package name: `com.anonymous.CreaGlass`

### 3. Criar Build Android

#### Opção A: Build de Preview (APK - Recomendado para testes)

Gera um APK que pode ser instalado diretamente no dispositivo:

```bash
npm run build:android:preview
```

Ou diretamente:
```bash
npx eas build --platform android --profile preview
```

**Características:**
- ✅ Gera APK (instalável diretamente)
- ✅ Distribuição interna
- ✅ Ideal para testes e compartilhamento

#### Opção B: Build de Produção (AAB - Para Google Play Store)

Gera um AAB (Android App Bundle) para publicação na Play Store:

```bash
npm run build:android:production
```

Ou diretamente:
```bash
npx eas build --platform android --profile production
```

**Características:**
- ✅ Gera AAB (formato da Play Store)
- ✅ Incrementa versão automaticamente
- ✅ Pronto para publicação

#### Opção C: Build de Desenvolvimento

Gera uma build com cliente de desenvolvimento:

```bash
npm run build:android:dev
```

Ou diretamente:
```bash
npx eas build --platform android --profile development
```

**Características:**
- ✅ Inclui ferramentas de desenvolvimento
- ✅ Hot reload disponível
- ✅ Para desenvolvimento e debug

### 4. Acompanhar o Progresso da Build

Após iniciar o comando, você verá:
- Um link para acompanhar a build no dashboard do Expo
- O processo leva aproximadamente 10-20 minutos
- Você receberá uma notificação quando concluir

### 5. Baixar a Build

Quando a build estiver pronta:

1. **Via Dashboard:**
   - Acesse: https://expo.dev/accounts/[seu-usuario]/projects/crea-glass/builds
   - Clique na build concluída
   - Clique em "Download" para baixar o APK/AAB

2. **Via CLI:**
   ```bash
   npm run build:list
   ```
   Ou:
   ```bash
   npx eas build:list --platform android
   ```
   Isso lista todas as builds. Use o ID da build para baixar:
   ```bash
   npx eas build:download --id [build-id]
   ```

### 6. Instalar o APK no Dispositivo Android

1. **Transferir o arquivo:**
   - Envie o APK para o dispositivo (email, Google Drive, etc.)

2. **Habilitar instalação de fontes desconhecidas:**
   - Vá em: Configurações → Segurança → Fontes desconhecidas (ou similar)
   - Ou quando abrir o APK, permita a instalação

3. **Instalar:**
   - Abra o arquivo APK no dispositivo
   - Toque em "Instalar"

## 📦 Tipos de Build

### Preview (APK)
- **Formato:** APK
- **Uso:** Testes, distribuição interna, instalação direta
- **Comando:** `npm run build:android:preview` ou `npx eas build --platform android --profile preview`

### Production (AAB)
- **Formato:** AAB (Android App Bundle)
- **Uso:** Publicação na Google Play Store
- **Comando:** `npm run build:android:production` ou `npx eas build --platform android --profile production`
- **Nota:** AAB não pode ser instalado diretamente, apenas via Play Store

### Development
- **Formato:** APK
- **Uso:** Desenvolvimento com ferramentas de debug
- **Comando:** `npm run build:android:dev` ou `npx eas build --platform android --profile development`

## 🔧 Configurações Avançadas

### Build Local (sem usar servidores do EAS)

Se você quiser construir localmente (requer Android SDK configurado):

```bash
npx eas build --platform android --local --profile preview
```

**Requisitos:**
- Android SDK instalado
- Variáveis de ambiente configuradas (`ANDROID_HOME`)
- Mais lento, mas não usa créditos do EAS

### Especificar Versão

Para especificar uma versão específica:

```bash
npx eas build --platform android --profile preview --version 1.0.1
```

### Build com Variáveis de Ambiente

Se você precisar passar variáveis de ambiente específicas:

```bash
npx eas build --platform android --profile preview --env-file .env.production
```

## 📊 Comandos Úteis

```bash
# Listar todas as builds
npm run build:list
# Ou: npx eas build:list --platform android

# Ver detalhes de uma build específica
npx eas build:view [build-id]

# Cancelar uma build em andamento
npx eas build:cancel [build-id]

# Ver status da última build
npx eas build:list --platform android --limit 1

# Baixar build específica
npx eas build:download --id [build-id]

# Ver logs de uma build
npx eas build:view [build-id] --logs
```

## 🐛 Solução de Problemas

### Erro: "Not logged in"
```bash
npx eas login
```

### Erro: "Project not found"
Verifique se o `projectId` no `app.json` está correto:
```json
"extra": {
  "eas": {
    "projectId": "b9318a96-8f54-4026-af36-7fe80a52e80a"
  }
}
```

### Build falha
1. Verifique os logs: `npx eas build:view [build-id] --logs`
2. Verifique se todas as dependências estão corretas
3. Verifique se os assets (ícones, splash) existem
4. Verifique se está usando `npx eas` ao invés de apenas `eas`

### APK não instala no dispositivo
1. Verifique se habilitou "Fontes desconhecidas"
2. Verifique se o dispositivo é compatível (arquitetura ARM/x86)
3. Tente gerar uma build específica para a arquitetura:
   ```bash
   npx eas build --platform android --profile preview
   ```

## 📝 Notas Importantes

1. **Primeira Build:** A primeira build pode demorar mais (criação de credenciais)
2. **Créditos EAS:** Builds na nuvem consomem créditos (plano gratuito tem limite)
3. **Assinatura:** O EAS gerencia automaticamente a assinatura do APK/AAB
4. **Versão:** O perfil `production` incrementa automaticamente a versão

## 🔗 Links Úteis

- Dashboard Expo: https://expo.dev
- Documentação EAS Build: https://docs.expo.dev/build/introduction/
- Status do EAS: https://status.expo.dev

---

**Dúvidas?** Consulte a documentação oficial do EAS Build ou verifique os logs da build.
