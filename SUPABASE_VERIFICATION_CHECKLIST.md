# ✅ Checklist de Verificação - Supabase

## Status Atual da Conexão

### ✅ Configuração do Cliente Supabase
- [x] Cliente Supabase configurado em `src/services/supabase.ts`
- [x] URL do Supabase configurada: `https://gnbdumignnzftyzdoztv.supabase.co`
- [x] Chave anônima configurada
- [x] Storage adaptado para Web (localStorage) e Mobile (AsyncStorage)
- [x] Realtime habilitado
- [x] Auto-refresh de tokens configurado

### ✅ Repositórios Implementados
- [x] `SupabaseAuthRepository` - Autenticação
- [x] `SupabaseUsersRepository` - Usuários
- [x] `SupabasePermissionsRepository` - Permissões
- [x] `SupabaseDocumentsRepository` - Documentos
- [x] `SupabaseInventoryRepository` - Inventário
- [x] `SupabaseNotificationsRepository` - Notificações
- [x] `SupabaseBloodPriorityRepository` - Blood Priority
- [x] `SupabaseEventsRepository` - Eventos
- [x] `SupabaseProductionRepository` - Produção

### ✅ Container de Dependências
- [x] Configurado para usar Supabase por padrão
- [x] Fallback para Mock repositories quando `EXPO_PUBLIC_USE_MOCK_REPOSITORIES=true`
- [x] Todos os repositórios injetados corretamente

## ⚠️ Verificações Necessárias

### 1. Arquivo .env
**Status:** ⚠️ **FALTA CRIAR**

O arquivo `.env` não existe. Você precisa criar um baseado no `.env.example`:

```bash
cp .env.example .env
```

**Conteúdo necessário:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://gnbdumignnzftyzdoztv.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduYmR1bWlnbm56ZnR5emRvenR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0OTg2NjEsImV4cCI6MjA4NDA3NDY2MX0.Nxqt5rpp17bWnIJXt6xxtDztp0Zh0WWUx3alfHDMMr8
EXPO_PUBLIC_USE_MOCK_REPOSITORIES=false
```

**Nota:** O código tem valores padrão hardcoded, então funciona sem `.env`, mas é recomendado usar variáveis de ambiente.

### 2. Migrações do Banco de Dados
**Status:** ⚠️ **VERIFICAR NO SUPABASE**

Você precisa verificar se todas as tabelas foram criadas no Supabase:

#### Tabelas Necessárias:
- [ ] `users` - Perfis de usuários
- [ ] `permissions` - Permissões do sistema
- [ ] `user_permissions` - Permissões por usuário
- [ ] `documents` - Documentos
- [ ] `inventory_groups` - Grupos de inventário
- [ ] `inventory_items` - Itens de inventário
- [ ] `inventory_history` - Histórico de alterações
- [ ] `notifications` - Notificações
- [ ] `notification_reads` - Rastreamento de leituras (migração disponível)
- [ ] `blood_priority_messages` - Mensagens Blood Priority
- [ ] `blood_priority_reads` - Confirmações de leitura
- [ ] `events` - Eventos
- [ ] `productions` - Produções
- [ ] `production_items` - Itens de produção
- [ ] `production_attachments` - Anexos de produção
- [ ] `production_status_history` - Histórico de status

#### Como Verificar:
1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá para **Table Editor**
3. Verifique se todas as tabelas listadas acima existem

### 3. Row Level Security (RLS)
**Status:** ⚠️ **VERIFICAR NO SUPABASE**

Todas as tabelas devem ter RLS habilitado com políticas adequadas:

- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas de SELECT configuradas
- [ ] Políticas de INSERT configuradas
- [ ] Políticas de UPDATE configuradas
- [ ] Políticas de DELETE configuradas
- [ ] Política especial para usuário Master

### 4. Storage Bucket
**Status:** ⚠️ **VERIFICAR NO SUPABASE**

- [ ] Bucket `documents` criado
- [ ] Políticas de acesso configuradas
- [ ] Política de visualização para usuários autenticados
- [ ] Política de upload baseada em permissões
- [ ] Política de delete baseada em permissões

### 5. Usuário Master "Pia"
**Status:** ⚠️ **VERIFICAR NO SUPABASE**

- [ ] Usuário criado no Supabase Auth:
  - Email: `Pia@creaglass.local`
  - Password: `Happiness`
- [ ] Perfil criado na tabela `users`:
  - `username`: `Pia`
  - `user_type`: `Master`
  - `is_active`: `true`

### 6. Edge Function (Opcional)
**Status:** ⚠️ **OPCIONAL**

- [ ] Edge Function `create-master-user` deployada (se usar)
- [ ] Variáveis de ambiente configuradas na Edge Function

## 🔧 Como Verificar a Conexão

### Teste Rápido no Código

1. **Verificar se está usando Supabase:**
```typescript
// No console do app, verifique:
console.log('Using Mock:', process.env.EXPO_PUBLIC_USE_MOCK_REPOSITORIES);
// Deve retornar: false ou undefined
```

2. **Testar conexão:**
```typescript
// No código, você pode testar:
import { supabase } from './src/services/supabase';
const { data, error } = await supabase.from('users').select('count');
console.log('Connection test:', error ? 'Failed' : 'Success');
```

### Teste no Supabase Dashboard

1. Acesse o **SQL Editor** no Supabase
2. Execute:
```sql
SELECT COUNT(*) FROM users;
```
3. Se retornar um número, a conexão está funcionando

## 📋 Próximos Passos Recomendados

1. ✅ **Criar arquivo `.env`** (copiar do `.env.example`)
2. ✅ **Verificar todas as tabelas** no Supabase Dashboard
3. ✅ **Executar migração** `create_notification_reads.sql` se ainda não foi executada
4. ✅ **Verificar RLS** em todas as tabelas
5. ✅ **Verificar Storage** bucket `documents`
6. ✅ **Criar usuário Master** se ainda não existe
7. ✅ **Testar login** com usuário Master

## 🚨 Problemas Comuns

### "Invalid credentials"
- Verifique se o usuário foi criado no Supabase Auth
- Verifique se o perfil existe na tabela `users`

### "Permission denied"
- Verifique as políticas RLS
- Verifique se o usuário tem as permissões necessárias
- Verifique se está autenticado

### "Failed to upload file"
- Verifique se o bucket `documents` existe
- Verifique as políticas de storage

### "Failed to mark notification as read"
- Execute a migração `create_notification_reads.sql`
- Verifique as políticas RLS da tabela `notification_reads`

## 📞 Suporte

Se encontrar problemas, consulte:
- `SUPABASE_SETUP.md` - Guia completo de configuração
- Dashboard do Supabase - Para verificar tabelas e políticas
- Logs do Supabase - Para ver erros de RLS
