-- ============================================
-- CRIAR TABELA notification_reads
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Criar a tabela
CREATE TABLE IF NOT EXISTS notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_notification_reads_user_id ON notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_notification_id ON notification_reads(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_user_notification ON notification_reads(user_id, notification_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver seus próprios registros de leitura
CREATE POLICY "Users can view their own notification reads"
  ON notification_reads
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem inserir seus próprios registros de leitura
CREATE POLICY "Users can insert their own notification reads"
  ON notification_reads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar seus próprios registros de leitura
CREATE POLICY "Users can update their own notification reads"
  ON notification_reads
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários Master podem fazer tudo
CREATE POLICY "Master users can manage all notification reads"
  ON notification_reads
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.user_type = 'Master'
      AND users.is_active = true
    )
  );

-- Verificar se foi criada com sucesso
SELECT 
  '✅ Tabela notification_reads criada com sucesso!' as status,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'notification_reads';
