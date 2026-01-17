-- ============================================
-- VERIFICAÇÃO COMPLETA DA TABELA notification_reads
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. VERIFICAR ESTRUTURA DA TABELA (COLUNAS)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name = 'id' THEN '✅ Chave Primária'
    WHEN column_name = 'notification_id' THEN '✅ Foreign Key para notifications'
    WHEN column_name = 'user_id' THEN '✅ Foreign Key para auth.users'
    WHEN column_name = 'read_at' THEN '✅ Timestamp de leitura'
    WHEN column_name = 'created_at' THEN '✅ Timestamp de criação'
    ELSE '✅ Coluna adicional'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'notification_reads'
ORDER BY ordinal_position;

-- 2. VERIFICAR ÍNDICES
SELECT 
  indexname,
  indexdef,
  CASE 
    WHEN indexname LIKE '%pkey%' THEN '✅ Chave Primária'
    WHEN indexname LIKE '%user_id%' THEN '✅ Índice para user_id'
    WHEN indexname LIKE '%notification_id%' THEN '✅ Índice para notification_id'
    WHEN indexname LIKE '%user_notification%' THEN '✅ Índice composto'
    ELSE '✅ Outro índice'
  END as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'notification_reads'
ORDER BY indexname;

-- 3. VERIFICAR RLS (Row Level Security)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename = 'notification_reads'
        AND rowsecurity = true
    ) THEN '✅ RLS HABILITADO'
    ELSE '❌ RLS DESABILITADO - PROBLEMA!'
  END as rls_status;

-- 4. VERIFICAR POLÍTICAS RLS
SELECT 
  policyname,
  cmd as operacao,
  CASE 
    WHEN cmd = 'SELECT' THEN '✅ Usuários podem ler'
    WHEN cmd = 'INSERT' THEN '✅ Usuários podem inserir'
    WHEN cmd = 'UPDATE' THEN '✅ Usuários podem atualizar'
    WHEN cmd = 'ALL' THEN '✅ Master pode tudo'
    ELSE '✅ Outra política'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'notification_reads'
ORDER BY policyname;

-- 5. VERIFICAR CONSTRAINTS (Foreign Keys e Unique)
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  CASE 
    WHEN contype = 'f' THEN '✅ Foreign Key'
    WHEN contype = 'u' THEN '✅ Unique Constraint'
    WHEN contype = 'p' THEN '✅ Primary Key'
    ELSE '✅ Outra constraint'
  END as status
FROM pg_constraint
WHERE conrelid = 'public.notification_reads'::regclass
ORDER BY contype, conname;

-- 6. VERIFICAR SE A TABELA ESTÁ VAZIA (NORMAL)
SELECT 
  COUNT(*) as total_registros,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Tabela vazia (normal - será preenchida quando houver notificações)'
    ELSE CONCAT('⚠️ Tabela tem ', COUNT(*), ' registros')
  END as status
FROM notification_reads;

-- 7. RESUMO FINAL
SELECT 
  '✅ ESTRUTURA' as verificacao,
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'notification_reads') >= 5 
    THEN '✅ Todas as colunas criadas'
    ELSE '❌ Faltam colunas'
  END as resultado
UNION ALL
SELECT 
  '✅ ÍNDICES',
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_indexes 
          WHERE schemaname = 'public' 
          AND tablename = 'notification_reads') >= 4 
    THEN '✅ Todos os índices criados'
    ELSE '❌ Faltam índices'
  END
UNION ALL
SELECT 
  '✅ RLS',
  CASE 
    WHEN (SELECT rowsecurity FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename = 'notification_reads') = true 
    THEN '✅ RLS habilitado'
    ELSE '❌ RLS desabilitado'
  END
UNION ALL
SELECT 
  '✅ POLÍTICAS',
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = 'notification_reads') >= 4 
    THEN '✅ Todas as políticas criadas'
    ELSE '❌ Faltam políticas'
  END;
