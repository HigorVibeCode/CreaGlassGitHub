# Como Executar o Crea Glass

Este guia mostra como executar o app em diferentes plataformas.

## 📋 Pré-requisitos

1. **Node.js** (versão 18 ou superior)
   - Verificar: `node --version`
   - Download: https://nodejs.org/

2. **npm** (vem com Node.js)
   - Verificar: `npm --version`

3. **Expo CLI** (opcional, mas recomendado)
   ```bash
   npm install -g expo-cli
   ```

4. **Para Android:**
   - Android Studio instalado
   - Emulador Android configurado OU dispositivo físico conectado com USB Debugging habilitado

5. **Para iOS (apenas macOS):**
   - Xcode instalado
   - CocoaPods instalado (`sudo gem install cocoapods`)
   - Simulador iOS OU dispositivo físico conectado

## 🚀 Instalação Inicial

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente (opcional):**
   ```bash
   # Copiar arquivo de exemplo
   cp .env.example .env
   
   # Editar .env se necessário (já está configurado por padrão)
   ```

## 📱 Executar o App

### Opção 1: Servidor de Desenvolvimento (Recomendado para começar)

Execute o servidor Expo e escolha a plataforma:

```bash
npm start
```

Ou:

```bash
expo start
```

Isso abrirá o **Expo Dev Tools** no navegador com um QR code e opções para:
- Escanear QR code com **Expo Go** (app no celular)
- Pressionar `a` para Android
- Pressionar `i` para iOS
- Pressionar `w` para Web

### Opção 2: Executar Diretamente em Plataforma Específica

#### 🌐 **Web (Navegador)**
```bash
npm run web
```
Ou:
```bash
expo start --web
```
O app abrirá automaticamente em `http://localhost:8081`

#### 🤖 **Android**
```bash
npm run android
```
Ou:
```bash
expo run:android
```

**Nota:** Isso compila e instala o app no emulador/dispositivo Android conectado.

#### 🍎 **iOS (apenas macOS)**
```bash
npm run ios
```
Ou:
```bash
expo run:ios
```

**Nota:** Isso compila e instala o app no simulador/dispositivo iOS.

## 📲 Usar Expo Go (Desenvolvimento Rápido)

1. **Instalar Expo Go:**
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Executar servidor:**
   ```bash
   npm start
   ```

3. **Escaneie o QR code:**
   - Android: Abra o Expo Go e toque em "Scan QR code"
   - iOS: Abra a câmera e toque na notificação quando aparecer o QR code

## 🔐 Credenciais de Login

Após iniciar o app, use estas credenciais:

- **Username:** `Pia`
- **Password:** `Happiness`

## 🛠️ Comandos Úteis

```bash
# Iniciar servidor de desenvolvimento
npm start

# Limpar cache e reiniciar
expo start --clear

# Executar lint (verificar código)
npm run lint

# Verificar dependências
npm list --depth=0

# Instalar dependências após mudanças no package.json
npm install
```

## 🐛 Solução de Problemas

### Erro: "Cannot find module"
```bash
# Limpar node_modules e reinstalar
rm -rf node_modules
npm install
```

### Erro: "Port already in use"
```bash
# Matar processo na porta 8081
# macOS/Linux:
lsof -ti:8081 | xargs kill -9

# Ou use outra porta:
expo start --port 8082
```

### Erro no Android: "SDK not found"
- Instale o Android SDK através do Android Studio
- Configure as variáveis de ambiente `ANDROID_HOME` e `PATH`

### Erro no iOS: "CocoaPods not found"
```bash
sudo gem install cocoapods
cd ios
pod install
cd ..
```

### App não conecta ao Supabase
1. Verifique se o arquivo `.env` existe
2. Verifique se as variáveis `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` estão configuradas
3. Reinicie o servidor após alterar `.env`

### Limpar cache do Metro Bundler
```bash
expo start --clear
# Ou
npx expo start --clear
```

## 📱 Modo de Desenvolvimento vs Produção

### Desenvolvimento (Padrão)
- Hot Reload ativo
- Logs detalhados no console
- Fonte de mapa disponível para debugging

### Produção
Para gerar build de produção:
```bash
# Android
eas build --platform android

# iOS
eas build --platform ios
```

## 🎯 Próximos Passos

1. Execute `npm start`
2. Escolha a plataforma desejada
3. Faça login com `Pia` / `Happiness`
4. Explore o app e teste as funcionalidades!

---

**Dúvidas?** Consulte a documentação do Expo: https://docs.expo.dev/
