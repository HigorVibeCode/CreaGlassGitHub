-- ============================================
-- ADICIONAR COLUNA created_at SE NÃO EXISTIR
-- Execute este script no SQL Editor
-- ============================================

-- Adicionar coluna created_at se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notification_reads'
      AND column_name = 'created_at'
  ) THEN
    ALTER TABLE notification_reads
    ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    
    RAISE NOTICE '✅ Coluna created_at adicionada com sucesso!';
  ELSE
    RAISE NOTICE '✅ Coluna created_at já existe!';
  END IF;
END $$;

-- Verificar se foi adicionada
SELECT 
  column_name,
  data_type,
  column_default,
  '✅ Coluna verificada' as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notification_reads'
  AND column_name = 'created_at';
