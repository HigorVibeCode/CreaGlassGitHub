# 🔍 Como Verificar o Supabase - Guia Visual

## 📸 Baseado na sua imagem, vejo que você já tem:

✅ **Tabela `users`** com 3 usuários (Pia, Joseph, Higor)  
✅ **Usuário Master "Pia"** configurado corretamente  
✅ **RLS Policies** na tabela users (3 políticas)  
✅ **Muitas tabelas** já criadas

---

## 🎯 Verificação Rápida (5 minutos)

### PASSO 1: Verificar Tabela `notification_reads`

Esta é a **única tabela crítica** que pode estar faltando.

**Como fazer:**
1. No Supabase Dashboard, olhe a lista de tabelas à esquerda
2. Procure por `notification_reads`
3. **Se NÃO encontrar**, siga estes passos:

   a. Clique em **SQL Editor** (ícone de código `</>` no menu lateral)
   
   b. Abra o arquivo `verificar_supabase.sql` que criei para você
   
   c. OU copie e cole este código SQL:

```sql
CREATE TABLE IF NOT EXISTS notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_reads_user_id ON notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_notification_id ON notification_reads(notification_id);

ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification reads"
  ON notification_reads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification reads"
  ON notification_reads FOR INSERT
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

   d. Clique em **RUN** (ou pressione `Ctrl+Enter` / `Cmd+Enter`)
   
   e. Deve aparecer: "Success. No rows returned"

---

### PASSO 2: Verificar Storage (Bucket `documents`)

**Como fazer:**
1. No menu lateral, clique em **Storage** (ícone de pasta)
2. Veja se existe um bucket chamado `documents`
3. **Se NÃO existir:**
   - Clique em **New bucket**
   - Nome: `documents`
   - **Public bucket**: ❌ Desmarcado (deve ser privado)
   - Clique em **Create bucket**

---

### PASSO 3: Verificar Autenticação do Usuário "Pia"

**Como fazer:**
1. No menu lateral, clique em **Authentication** (ícone de pessoa)
2. Clique em **Users**
3. Procure por um usuário com email: `Pia@creaglass.local`
4. **Se NÃO encontrar:**
   - Clique em **Add user** (botão verde)
   - Email: `Pia@creaglass.local`
   - Password: `Happiness`
   - ✅ Marque **Auto Confirm User**
   - Clique em **Create user**
   - **Copie o User ID** que aparece
   - Vá para **SQL Editor** e execute:

```sql
-- Substitua 'USER_ID_AQUI' pelo ID que você copiou
INSERT INTO users (id, username, user_type, is_active)
VALUES (
  'USER_ID_AQUI',
  'Pia',
  'Master',
  true
)
ON CONFLICT (id) DO NOTHING;
```

---

### PASSO 4: Executar Script de Verificação Completa

**Como fazer:**
1. Vá para **SQL Editor**
2. Abra o arquivo `verificar_supabase.sql` que criei
3. OU copie todo o conteúdo do arquivo
4. Cole no SQL Editor
5. Clique em **RUN**
6. Veja os resultados de cada verificação

O script vai mostrar:
- ✅ Quais tabelas existem
- ✅ Se `notification_reads` existe
- ✅ Status do RLS em cada tabela
- ✅ Políticas RLS configuradas
- ✅ Status do usuário Master
- ✅ Buckets de storage
- ✅ Contagem de registros

---

## ✅ Checklist Rápido

Marque conforme verificar:

- [ ] Tabela `notification_reads` existe? (Ver PASSO 1)
- [ ] Bucket `documents` existe? (Ver PASSO 2)
- [ ] Usuário Auth "Pia" existe? (Ver PASSO 3)
- [ ] Executei o script de verificação? (Ver PASSO 4)

---

## 🧪 Teste Final

Depois de verificar tudo:

1. **Abra o app**
2. **Tente fazer login:**
   - Username: `Pia`
   - Password: `Happiness`
3. **Se funcionar:** ✅ Tudo OK!
4. **Se der erro:** Veja qual erro e me avise

---

## 📋 O que você já tem (da sua imagem):

✅ Tabela `users` - OK  
✅ Usuário "Pia" na tabela - OK  
✅ RLS na tabela users - OK  
✅ Muitas outras tabelas - OK

## ⚠️ O que pode estar faltando:

1. Tabela `notification_reads` (crítica para notificações)
2. Bucket `documents` (para upload de arquivos)
3. Usuário Auth "Pia" (para login funcionar)

---

## 🆘 Precisa de Ajuda?

Se tiver dúvidas em algum passo, me avise qual passo e o que você vê na tela!
