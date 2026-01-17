-- ============================================
-- SCRIPT DE VERIFICAÇÃO DO SUPABASE
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. VERIFICAR TABELAS EXISTENTES
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      'users', 'permissions', 'user_permissions', 'documents',
      'inventory_groups', 'inventory_items', 'inventory_history',
      'notifications', 'notification_reads',
      'blood_priority_messages', 'blood_priority_reads',
      'events', 'productions', 'production_items',
      'production_attachments', 'production_status_history'
    ) THEN '✅ OK'
    ELSE '⚠️ Extra'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. VERIFICAR SE TABELA notification_reads EXISTE
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'notification_reads'
    ) THEN '✅ Tabela notification_reads EXISTE'
    ELSE '❌ Tabela notification_reads NÃO EXISTE - Execute a migração!'
  END as notification_reads_status;

-- 3. VERIFICAR RLS EM TODAS AS TABELAS
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS Habilitado'
    ELSE '❌ RLS DESABILITADO'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. VERIFICAR POLÍTICAS RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. VERIFICAR USUÁRIO MASTER "Pia"
SELECT 
  id,
  username,
  user_type,
  is_active,
  CASE 
    WHEN username = 'Pia' AND user_type = 'Master' AND is_active = true 
    THEN '✅ Usuário Master OK'
    ELSE '⚠️ Verificar configuração'
  END as status
FROM users
WHERE username = 'Pia';

-- 6. VERIFICAR STORAGE BUCKETS
SELECT 
  name,
  public,
  CASE 
    WHEN name = 'documents' THEN '✅ Bucket documents existe'
    ELSE '⚠️ Outro bucket'
  END as status
FROM storage.buckets;

-- 7. CONTAR REGISTROS EM TABELAS PRINCIPAIS
SELECT 
  'users' as tabela, COUNT(*) as total FROM users
UNION ALL
SELECT 'permissions', COUNT(*) FROM permissions
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'inventory_items', COUNT(*) FROM inventory_items
UNION ALL
SELECT 'productions', COUNT(*) FROM productions;

-- 8. VERIFICAR SE HÁ ÍNDICES NAS TABELAS PRINCIPAIS
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'notifications', 'notification_reads', 'documents')
ORDER BY tablename, indexname;
