# 🔍 Verificação do Supabase - Passo a Passo

## ✅ O que JÁ está funcionando (baseado na sua imagem)

Da imagem que você mostrou, posso ver que:

### ✅ Tabelas Existentes
Você já tem estas tabelas criadas:
- ✅ `users` - **CONFIRMADO** (com 3 usuários: Pia, Joseph, Higor)
- ✅ `blood_priority_messages`
- ✅ `blood_priority_reads`
- ✅ `documents`
- ✅ `event_attachments`
- ✅ `events`
- ✅ `inventory_groups`
- ✅ `inventory_history`
- ✅ `inventory_items`
- ✅ `notifications`
- ✅ `permissions`
- ✅ `procedure_documents`
- ✅ `production_attachments`
- ✅ `production_items`
- ✅ `production_status_history`
- ✅ `productions`
- ✅ `user_permissions`

### ✅ Usuário Master
- ✅ Usuário "Pia" existe
- ✅ Tipo: "Master"
- ✅ Status: Ativo (is_active: TRUE)

### ✅ RLS Policies
- ✅ Tabela `users` tem 3 políticas RLS configuradas

---

## 📋 Checklist de Verificação Completa

### PASSO 1: Verificar Tabela `notification_reads` ⚠️

Esta tabela é **CRÍTICA** para o sistema de notificações funcionar.

**Como verificar:**
1. No Supabase Dashboard, vá para **Table Editor**
2. Procure pela tabela `notification_reads` na lista do lado esquerdo
3. Se **NÃO existir**, você precisa criá-la:

**Como criar:**
1. Vá para **SQL Editor** (ícone de código no menu lateral)
2. Copie e cole este SQL:

```sql
-- Create notification_reads table
CREATE TABLE IF NOT EXISTS notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_reads_user_id ON notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_notification_id ON notification_reads(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_user_notification ON notification_reads(user_id, notification_id);

-- Enable RLS
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notification reads"
  ON notification_reads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification reads"
  ON notification_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification reads"
  ON notification_reads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Master users can manage all notification reads"
  ON notification_reads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'Master'
      AND users.is_active = true
    )
  );
```

3. Clique em **RUN** (ou pressione Ctrl+Enter)
4. Deve aparecer "Success. No rows returned"

---

### PASSO 2: Verificar RLS em Todas as Tabelas

Para cada tabela, verifique se RLS está habilitado:

**Como verificar:**
1. Clique em uma tabela (ex: `notifications`)
2. Veja se aparece "X RLS policies" no topo (como você viu "3 RLS policies" na tabela `users`)
3. Se não aparecer ou aparecer "0 RLS policies", precisa configurar

**Tabelas que DEVEM ter RLS:**
- [ ] `users` - ✅ Já tem (3 policies)
- [ ] `permissions`
- [ ] `user_permissions`
- [ ] `documents`
- [ ] `inventory_groups`
- [ ] `inventory_items`
- [ ] `inventory_history`
- [ ] `notifications`
- [ ] `notification_reads` (se existir)
- [ ] `blood_priority_messages`
- [ ] `blood_priority_reads`
- [ ] `events`
- [ ] `productions`
- [ ] `production_items`
- [ ] `production_attachments`
- [ ] `production_status_history`

**Como habilitar RLS:**
1. Vá para **SQL Editor**
2. Execute para cada tabela:

```sql
-- Exemplo para tabela 'notifications'
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

---

### PASSO 3: Verificar Storage Bucket

**Como verificar:**
1. No menu lateral, clique em **Storage**
2. Procure por um bucket chamado `documents`
3. Se não existir, crie:

**Como criar:**
1. Em **Storage**, clique em **New bucket**
2. Nome: `documents`
3. **Public bucket**: Desmarcado (privado)
4. Clique em **Create bucket**

**Verificar políticas do bucket:**
1. Clique no bucket `documents`
2. Vá para a aba **Policies**
3. Deve ter políticas para:
   - Visualizar arquivos (SELECT)
   - Fazer upload (INSERT) - apenas com permissão
   - Deletar (DELETE) - apenas com permissão

---

### PASSO 4: Verificar Autenticação do Usuário "Pia"

**Como verificar:**
1. No menu lateral, clique em **Authentication**
2. Vá para **Users**
3. Procure pelo usuário com email `Pia@creaglass.local`
4. Verifique:
   - [ ] Email: `Pia@creaglass.local`
   - [ ] Status: Ativo
   - [ ] User ID deve ser o mesmo que está na tabela `users`

**Se o usuário não existir:**
1. Clique em **Add user**
2. Email: `Pia@creaglass.local`
3. Password: `Happiness`
4. Auto Confirm User: ✅ Marcado
5. Clique em **Create user**
6. Copie o **User ID** gerado
7. Vá para **SQL Editor** e execute:

```sql
INSERT INTO users (id, username, user_type, is_active)
VALUES (
  'USER_ID_COPIADO_AQUI',
  'Pia',
  'Master',
  true
);
```

---

### PASSO 5: Teste de Conexão

**Teste rápido no app:**
1. Abra o app
2. Tente fazer login com:
   - Username: `Pia`
   - Password: `Happiness`
3. Se funcionar, a conexão está OK! ✅

---

## 🎯 Resumo Rápido

### ✅ Já está OK:
- ✅ Todas as tabelas principais existem
- ✅ Usuário Master "Pia" existe na tabela `users`
- ✅ RLS está configurado na tabela `users`

### ⚠️ Precisa verificar:
1. **Tabela `notification_reads`** - Criar se não existir
2. **RLS em outras tabelas** - Verificar se todas têm políticas
3. **Storage bucket `documents`** - Criar se não existir
4. **Usuário Auth "Pia"** - Verificar se existe no Authentication

---

## 🆘 Se Algo Não Funcionar

### Erro: "Permission denied"
- Verifique se RLS está habilitado
- Verifique se as políticas permitem a ação

### Erro: "Failed to mark notification as read"
- Crie a tabela `notification_reads` (PASSO 1)

### Erro: "Failed to upload file"
- Crie o bucket `documents` (PASSO 3)
- Verifique as políticas do bucket

### Erro: "Invalid credentials"
- Verifique se o usuário existe no Authentication (PASSO 4)
- Verifique se o perfil existe na tabela `users`

---

## 📞 Próximos Passos

Depois de verificar tudo acima:
1. Teste o login no app
2. Teste criar um documento
3. Teste criar uma notificação
4. Se tudo funcionar, está 100% configurado! 🎉
