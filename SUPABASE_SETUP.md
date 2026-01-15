# Supabase Integration Guide

Este documento descreve a integração do Crea Glass com Supabase para sincronização em tempo real entre todos os dispositivos.

## Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
EXPO_PUBLIC_SUPABASE_URL=https://gnbdumignnzftyzdoztv.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduYmR1bWlnbm56ZnR5emRvenR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTg2NjEsImV4cCI6MjA4NDA3NDY2MX0.Nxqt5rpp17bWnIJXt6xxtDztp0Zh0WWUx3alfHDMMr8
EXPO_PUBLIC_USE_MOCK_REPOSITORIES=false
```

### 2. Criar Usuário Master

O usuário Master "Pia" precisa ser criado no Supabase. Há duas opções:

#### Opção 1: Via Dashboard do Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá para Authentication > Users
3. Clique em "Add User"
4. Crie um usuário com:
   - Email: `Pia@creaglass.local`
   - Password: `Happiness`
5. Copie o User ID gerado
6. No SQL Editor, execute:

```sql
INSERT INTO users (id, username, user_type, is_active)
VALUES (
  'USER_ID_AQUI',
  'Pia',
  'Master',
  true
);
```

#### Opção 2: Via Edge Function (Recomendado)

Crie uma Edge Function para criação de usuários:

```typescript
// supabase/functions/create-user/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { username, password, userType } = await req.json()
  
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const email = `${username}@creaglass.local`
  
  // Create auth user
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !authUser.user) {
    return new Response(JSON.stringify({ error: authError.message }), { status: 400 })
  }

  // Create user profile
  const { error: profileError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authUser.user.id,
      username,
      user_type: userType,
      is_active: true,
    })

  if (profileError) {
    // Clean up auth user
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    return new Response(JSON.stringify({ error: profileError.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ success: true, userId: authUser.user.id }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

## Estrutura do Banco de Dados

Todas as tabelas foram criadas através de migrações:

- `users` - Perfis de usuários
- `permissions` - Permissões do sistema
- `user_permissions` - Permissões por usuário
- `documents` - Documentos
- `inventory_groups` - Grupos de inventário
- `inventory_items` - Itens de inventário
- `inventory_history` - Histórico de alterações de inventário
- `notifications` - Notificações
- `notification_reads` - Rastreamento de leituras de notificações por usuário
- `blood_priority_messages` - Mensagens Blood Priority
- `blood_priority_reads` - Confirmações de leitura
- `events` - Eventos
- `productions` - Produções
- `production_items` - Itens de produção
- `production_attachments` - Anexos de produção
- `production_status_history` - Histórico de status

## Row Level Security (RLS)

Todas as tabelas têm RLS habilitado com políticas que:

- Permitem acesso baseado em permissões do usuário
- Respeitam o sistema de permissões granular
- Dão acesso total ao usuário Master
- Protegem dados sensíveis

## Storage

Um bucket `documents` foi criado para armazenar documentos e anexos. As políticas de acesso garantem que apenas usuários autenticados possam:

- Visualizar documentos
- Fazer upload (se tiverem permissão)
- Deletar (se tiverem permissão)

## Sincronização em Tempo Real

O Supabase fornece sincronização automática em tempo real através de:

1. **Subscriptions**: As mudanças no banco são automaticamente propagadas
2. **React Query**: Cache e invalidação automática de queries
3. **Supabase Client**: Gerenciamento automático de sessões

## Migração de Mock para Supabase

Para alternar entre repositórios mock e Supabase, altere a variável:

```env
EXPO_PUBLIC_USE_MOCK_REPOSITORIES=false  # Usa Supabase (padrão)
EXPO_PUBLIC_USE_MOCK_REPOSITORIES=true   # Usa Mock (para desenvolvimento)
```

## Migração: Criar Tabela notification_reads

Para que o sistema de marcação de notificações como lidas funcione corretamente, é necessário criar a tabela `notification_reads`. Execute o seguinte SQL no SQL Editor do Supabase:

```sql
-- Execute o arquivo: supabase/migrations/create_notification_reads.sql
-- Ou copie e cole o conteúdo do arquivo no SQL Editor
```

A tabela `notification_reads` é usada para rastrear quais notificações foram lidas por quais usuários, evitando problemas com políticas RLS ao tentar atualizar diretamente a tabela `notifications`.

## Troubleshooting

### Erro: "Invalid credentials"
- Verifique se o usuário foi criado no Supabase Auth
- Verifique se o perfil do usuário existe na tabela `users`
- Verifique se o email segue o padrão `username@creaglass.local`

### Erro: "Permission denied"
- Verifique as políticas RLS
- Verifique se o usuário tem as permissões necessárias
- Verifique se o usuário está autenticado
- Verifique se a tabela `notification_reads` foi criada (necessária para marcar notificações como lidas)

### Erro: "Failed to upload file"
- Verifique se o bucket `documents` existe
- Verifique as políticas de storage
- Verifique o tamanho do arquivo (limite: 50MB)

### Erro: "Failed to mark notification as read"
- Verifique se a tabela `notification_reads` foi criada
- Execute a migração SQL em `supabase/migrations/create_notification_reads.sql`
- Verifique se as políticas RLS da tabela `notification_reads` estão corretas

## Próximos Passos

1. Criar Edge Function para criação de usuários
2. Implementar notificações push (opcional)
3. Configurar backups automáticos
4. Implementar analytics (opcional)
