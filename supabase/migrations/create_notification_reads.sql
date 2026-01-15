-- Create notification_reads table to track which notifications have been read by which users
-- This table is used instead of updating the read_at field directly on notifications
-- to avoid RLS policy issues

CREATE TABLE IF NOT EXISTS notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notification_reads_user_id ON notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_notification_id ON notification_reads(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_user_notification ON notification_reads(user_id, notification_id);

-- Enable RLS
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own read records
CREATE POLICY "Users can view their own notification reads"
  ON notification_reads
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own read records
CREATE POLICY "Users can insert their own notification reads"
  ON notification_reads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own read records
CREATE POLICY "Users can update their own notification reads"
  ON notification_reads
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Master users can do everything
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
