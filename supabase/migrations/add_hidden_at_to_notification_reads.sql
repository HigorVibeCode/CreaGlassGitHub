-- ============================================
-- ADICIONAR CAMPO hidden_at NA TABELA notification_reads
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Adicionar coluna hidden_at se não existir
ALTER TABLE notification_reads
ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ;

-- Criar índice para melhor performance nas queries
CREATE INDEX IF NOT EXISTS idx_notification_reads_hidden_at 
ON notification_reads(user_id, hidden_at) 
WHERE hidden_at IS NOT NULL;

-- Comentário explicativo
COMMENT ON COLUMN notification_reads.hidden_at IS 'Timestamp quando a notificação foi ocultada/removida pelo usuário via Clear All';
