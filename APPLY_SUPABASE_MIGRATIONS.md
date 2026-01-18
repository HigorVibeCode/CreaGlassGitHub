# Aplicar Migrations no Supabase - Checkpoint AuthGuard Fix

## ✅ Commit e Push Realizados

O código foi commitado e enviado para o GitHub com sucesso:
- **Branch:** `restore-v1.1.0`
- **Commit:** `4efc8b4` - "fix: Corrigir AuthGuard para sempre redirecionar para login sem sessão"

## 📋 Migrations para Aplicar no Supabase

Todas as migrations necessárias já estão commitadas. Se ainda não foram aplicadas no seu banco de dados Supabase, siga os passos abaixo:

### Método 1: Via SQL Editor do Supabase Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto: `gnbdumignnzftyzdoztv`

2. **Abra o SQL Editor:**
   - No menu lateral, clique em **"SQL Editor"**
   - Clique em **"New query"**

3. **Execute as migrations na ordem:**

#### Migration Crítica: Fix RLS e Storage Bucket de Assinaturas

Execute o arquivo: `supabase/migrations/fix_signatures_rls_and_create_bucket.sql`

Esta migration:
- ✅ Corrige a política RLS recursiva da tabela `work_order_signatures`
- ✅ Cria o bucket `signatures` no Storage para armazenar imagens de assinaturas
- ✅ Define políticas de acesso ao bucket

**⚠️ IMPORTANTE:** Se você já aplicou migrations anteriores de Work Orders, esta migration é obrigatória para que as assinaturas funcionem corretamente.

### Verificar se as migrations foram aplicadas

Execute este SQL para verificar:

```sql
-- Verificar se o bucket 'signatures' existe
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'signatures';

-- Verificar políticas RLS da tabela work_order_signatures
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'work_order_signatures';
```

### Migrations Completas de Work Orders (se ainda não aplicadas)

Se você ainda não aplicou as migrations de Work Orders, execute na ordem abaixo:

1. `create_work_orders_table.sql` - Tabela principal
2. `create_work_order_checkins_table.sql` - Check-ins
3. `create_work_order_time_statuses_table.sql` - Time tracking
4. `create_work_order_service_logs_table.sql` - Service logs
5. `create_work_order_evidences_table.sql` - Evidências
6. `create_work_order_checklist_items_table.sql` - Checklist
7. `create_work_order_signatures_table.sql` - Assinaturas
8. `fix_signatures_rls_and_create_bucket.sql` - ⭐ **OBRIGATÓRIA** - Corrige RLS e cria bucket

Veja o arquivo `WORK_ORDERS_MIGRATIONS_GUIDE.md` para detalhes completos.

## 🔍 Como Copiar o Conteúdo das Migrations

1. Abra o arquivo `.sql` no seu editor de código
2. Selecione todo o conteúdo (Cmd+A / Ctrl+A)
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** ou pressione Cmd+Enter (Mac) / Ctrl+Enter (Windows)

## 📝 Notas Importantes

- ⚠️ **Não execute migrations duplicadas** - Se uma tabela ou política já existe, a migration pode falhar com erro "already exists"
- ✅ **Migrations são idempotentes** quando usam `IF NOT EXISTS` ou `ON CONFLICT DO NOTHING`
- 🔐 **Sempre faça backup** antes de executar migrations em produção
- 📊 **Verifique logs** após executar cada migration para confirmar sucesso

## ✅ Checklist de Verificação

Após aplicar as migrations, verifique:

- [ ] Bucket `signatures` criado no Storage
- [ ] Política RLS `work_order_signatures` corrigida (sem recursão)
- [ ] Tabela `work_orders` existe e tem RLS habilitado
- [ ] Tabela `work_order_signatures` existe e tem RLS habilitado
- [ ] Políticas de Storage para bucket `signatures` estão ativas

## 🆘 Troubleshooting

### Erro: "relation already exists"
A migration já foi aplicada anteriormente. Pode ignorar ou usar `DROP ... IF EXISTS` antes de recriar.

### Erro: "policy already exists"
A política RLS já existe. As migrations usam `DROP POLICY IF EXISTS` para evitar esse erro.

### Erro: "bucket already exists"
O bucket já foi criado. A migration usa `ON CONFLICT DO NOTHING` para evitar esse erro.

### Erro: "permission denied"
Certifique-se de estar usando um usuário com permissões de administrador no Supabase.

## 📚 Referências

- `WORK_ORDERS_MIGRATIONS_GUIDE.md` - Guia completo de migrations de Work Orders
- `fix_signatures_rls_and_create_bucket.sql` - Migration de correção RLS e bucket
- Supabase Dashboard: https://supabase.com/dashboard/project/gnbdumignnzftyzdoztv/sql
