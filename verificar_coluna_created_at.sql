-- ============================================
-- VERIFICAR SE A COLUNA created_at EXISTE
-- Execute este script no SQL Editor
-- ============================================

-- Verificar todas as colunas da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name = 'created_at' THEN '✅ COLUNA created_at EXISTE'
    ELSE '✅ Outra coluna'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notification_reads'
ORDER BY ordinal_position;

-- Verificar especificamente se created_at existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'notification_reads'
        AND column_name = 'created_at'
    ) THEN '✅ COLUNA created_at EXISTE - TUDO OK!'
    ELSE '❌ COLUNA created_at NÃO EXISTE - Precisa adicionar!'
  END as status_created_at;
