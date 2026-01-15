# Guia de Conexão Android com Expo

## 🚨 Problema: App não inicia ou não conecta com o Expo

### Solução Passo a Passo

#### Opção 1: Usando Expo Go (Mais Fácil) ⭐ Recomendado

1. **Instalar Expo Go no seu dispositivo Android:**
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Iniciar o servidor Expo:**
   ```bash
   npm start
   ```
   Isso abrirá o Expo Dev Tools no navegador.

3. **Conectar o dispositivo:**
   - **Mesma rede Wi-Fi:** Certifique-se de que seu computador e Android estão na mesma rede Wi-Fi
   - **Escanear QR Code:**
     - Abra o app Expo Go no Android
     - Toque em "Scan QR code"
     - Escaneie o QR code exibido no terminal ou no navegador

4. **Se o QR code não funcionar:**
   - No terminal, pressione `a` para iniciar no Android
   - Ou use a URL manual:
     - O terminal mostrará algo como: `exp://192.168.x.x:8081`
     - No Expo Go, toque em "Enter URL manually" e cole o endereço

#### Opção 2: USB Debugging (Dispositivo Físico)

1. **Habilitar USB Debugging no Android:**
   - Vá em Configurações > Sobre o telefone
   - Toque 7 vezes em "Número da versão" para ativar "Opções do desenvolvedor"
   - Vá em Configurações > Sistema > Opções do desenvolvedor
   - Ative "Depuração USB"
   - Conecte o dispositivo via USB ao computador

2. **Verificar conexão ADB:**
   ```bash
   adb devices
   ```
   Deve mostrar seu dispositivo conectado.

3. **Iniciar servidor:**
   ```bash
   npm start
   ```
   No terminal, pressione `a` para iniciar no Android conectado.

#### Opção 3: Emulador Android

1. **Iniciar o emulador Android:**
   - Abra o Android Studio
   - Vá em Tools > Device Manager
   - Inicie um emulador

2. **Iniciar servidor:**
   ```bash
   npm start
   ```
   No terminal, pressione `a` para iniciar no emulador.

#### Opção 4: Desenvolvimento Nativo (Build Completo)

Se você quer testar como um app nativo instalado:

```bash
npm run android
```

**Nota:** Isso compila e instala o app no dispositivo/emulador (pode demorar alguns minutos na primeira vez).

## 🔧 Solução de Problemas Comuns

### Problema 1: "Unable to connect to Metro bundler"

**Solução:**
1. Verifique se o servidor está rodando: `npm start`
2. Certifique-se de que está na mesma rede Wi-Fi
3. Tente usar o modo Tunnel:
   ```bash
   npm start -- --tunnel
   ```
   Ou pressione `shift+t` no terminal do Expo

### Problema 2: QR Code não funciona

**Solução:**
1. Use a URL manual exibida no terminal
2. Ou tente o modo LAN:
   ```bash
   npm start -- --lan
   ```

### Problema 3: "Network request failed"

**Solução:**
1. Desative temporariamente o firewall do macOS
2. Ou configure exceções para a porta 8081
3. Verifique se não há proxy bloqueando

### Problema 4: Dispositivo não aparece no `adb devices`

**Solução:**
1. Desconecte e reconecte o cabo USB
2. No Android, permita a depuração USB quando solicitado
3. Tente outro cabo USB ou porta USB
4. Reinicie o ADB:
   ```bash
   adb kill-server
   adb start-server
   adb devices
   ```

### Problema 5: Erro "Unable to resolve host"

**Solução:**
1. Verifique o IP do seu computador:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
2. No Android, certifique-se de que o Wi-Fi está ativo
3. Tente reiniciar o servidor com IP específico:
   ```bash
   EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 npm start
   ```

### Problema 6: App abre mas mostra tela branca ou erro

**Solução:**
1. Limpe o cache do Expo:
   ```bash
   npm start -- --clear
   ```
2. No Expo Go, force fechar e reabra o app
3. Verifique os logs no terminal para ver erros específicos

## 📱 Comandos Rápidos

```bash
# Iniciar servidor normal
npm start

# Iniciar com modo Tunnel (funciona mesmo fora da mesma rede)
npm start -- --tunnel

# Iniciar com modo LAN (rede local)
npm start -- --lan

# Limpar cache e iniciar
npm start -- --clear

# Iniciar no Android diretamente (se conectado)
npm start
# Depois pressione 'a' no terminal

# Build e instalação nativa
npm run android
```

## ✅ Checklist de Verificação

Antes de reportar problemas, verifique:

- [ ] Servidor Expo está rodando (`npm start`)
- [ ] Expo Go está instalado no Android (se usando Expo Go)
- [ ] Android e computador estão na mesma rede Wi-Fi
- [ ] Firewall não está bloqueando a porta 8081
- [ ] USB Debugging está ativado (se usando USB)
- [ ] Dispositivo aparece em `adb devices` (se usando USB)
- [ ] Tentou limpar cache (`npm start -- --clear`)
- [ ] Tentou modo Tunnel (`npm start -- --tunnel`)

## 🌐 Modo Tunnel vs LAN vs Localhost

- **Localhost:** Apenas na mesma máquina (localhost)
- **LAN:** Mesma rede Wi-Fi/Ethernet (mais rápido)
- **Tunnel:** Funciona de qualquer lugar, mesmo redes diferentes (mais lento, mas mais confiável)

Para desenvolvimento, use **LAN** se possível. Use **Tunnel** apenas se LAN não funcionar.

---

**Dúvidas?** Consulte: https://docs.expo.dev/development/introduction/
