# 🌐 Guia de Layout Responsivo para Web

Este documento descreve como o layout responsivo está configurado para a versão web do Crea Glass.

## 📐 Limitação de Largura Máxima

Para evitar que os itens fiquem excessivamente esticados em monitores wide screen, implementamos:

### ScreenWrapper Component

O componente `ScreenWrapper` agora limita automaticamente a largura máxima na web:

- **Largura máxima padrão:** `1400px`
- **Largura máxima customizável:** via prop `maxWidth`
- **Centralização:** conteúdo centralizado automaticamente em telas maiores
- **Padding lateral:** `24px` para espaçamento adequado

### Uso

```tsx
// Com largura padrão (1400px)
<ScreenWrapper>
  {children}
</ScreenWrapper>

// Com largura customizada
<ScreenWrapper maxWidth={1200}>
  {children}
</ScreenWrapper>
```

## 🎨 Estrutura do Layout

### Hierarquia de Componentes

```
ScreenWrapper (max-width: 1400px na web)
  └─ ScrollView (flex: 1)
       └─ View.content (padding: theme.spacing.md)
            └─ Conteúdo da tela (cards, listas, etc.)
```

### Breakpoints Recomendados

Para diferentes tipos de telas, você pode ajustar `maxWidth`:

- **Telas pequenas (< 768px):** `maxWidth` não aplicado (100% width)
- **Tablets (768px - 1024px):** `maxWidth={1024}`
- **Desktop padrão (1024px - 1440px):** `maxWidth={1400}` (padrão)
- **Wide screen (1440px+):** `maxWidth={1600}` (para telas muito grandes)

## 📱 Componentes Aplicados

O layout responsivo está aplicado automaticamente nos seguintes componentes:

### Barras de Navegação
- ✅ **TopBar** (Barra superior) - Limitada a 1400px e centralizada
- ✅ **TabBar** (Barra inferior de navegação) - Limitada a 1400px e centralizada

### Telas
- ✅ **Production** (`app/(tabs)/production.tsx`)
- ✅ **Events** (`app/(tabs)/events.tsx`)
- ✅ **Inventory** (`app/(tabs)/inventory.tsx`)
- ✅ **Documents** (`app/(tabs)/documents.tsx`)

Todas as barras e telas agora têm a mesma largura máxima (1400px) e estão centralizadas em monitores wide screen.

## 🎯 Benefícios

1. **Legibilidade:** Conteúdo não fica esticado em telas largas
2. **UX melhorada:** Fácil de ler e navegar
3. **Consistência:** Mesmo layout em diferentes tamanhos de tela
4. **Responsivo:** Adapta-se automaticamente (não afeta mobile/native)

## ⚙️ Customização

### Alterar Largura Máxima Padrão

Edite `src/components/shared/ScreenWrapper.tsx`:

```tsx
maxWidth = 1400, // Altere este valor
```

### Aplicar em Nova Tela

```tsx
import { ScreenWrapper } from '../../src/components/shared/ScreenWrapper';

export default function MinhaTela() {
  return (
    <ScreenWrapper maxWidth={1200}>
      {/* Seu conteúdo */}
    </ScreenWrapper>
  );
}
```

## 📊 Exemplo Visual

```
┌─────────────────────────────────────────────────────────┐
│                    TopBar (Full Width)                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │      Conteúdo Limitado (max-width: 1400px)     │   │
│  │                                                 │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │ Card 1                                  │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  │                                                 │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │ Card 2                                  │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│                    (Espaço vazio em monitores largos)   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔍 Verificação

Para verificar se o layout está funcionando:

1. Abra o app na web (`npm run web`)
2. Redimensione a janela do navegador
3. Em telas largas (> 1400px), o conteúdo deve ficar centralizado e limitado
4. Em telas menores, o conteúdo deve usar 100% da largura

## 🛠️ Troubleshooting

### Conteúdo ainda está esticado

- Verifique se a tela usa `<ScreenWrapper>`
- Verifique se não há `width: '100%'` hardcoded nos estilos internos
- Verifique o console do navegador para erros de estilo

### Padding lateral excessivo em mobile

O padding lateral (`24px`) só é aplicado na web. Em mobile/native, o padding padrão é mantido.

### Cards ainda ficam muito largos

Considere limitar a largura dos cards individualmente:

```tsx
const styles = StyleSheet.create({
  card: {
    ...(Platform.OS === 'web' && {
      maxWidth: 600, // Largura máxima do card
    }),
  },
});
```
