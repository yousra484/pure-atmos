-- Migration: Add rapport_url and rapport_uploaded_at columns to demandes_etudes table
-- Date: 2025-08-26
-- Description: Adds columns for storing PDF report URLs and upload timestamps

-- Add rapport_url column to store the URL of uploaded PDF reports
ALTER TABLE demandes_etudes 
ADD COLUMN IF NOT EXISTS rapport_url TEXT;

-- Add rapport_uploaded_at column to track when reports were uploaded
ALTER TABLE demandes_etudes 
ADD COLUMN IF NOT EXISTS rapport_uploaded_at TIMESTAMPTZ;

-- Add comment to document the purpose of these columns
COMMENT ON COLUMN demandes_etudes.rapport_url IS 'URL of the uploaded PDF report file stored in Supabase Storage';
COMMENT ON COLUMN demandes_etudes.rapport_uploaded_at IS 'Timestamp when the report was uploaded';

-- Create index on rapport_uploaded_at for better query performance
CREATE INDEX IF NOT EXISTS idx_demandes_etudes_rapport_uploaded_at 
ON demandes_etudes(rapport_uploaded_at);

-- Update RLS policies to allow intervenants to update rapport fields for their assigned missions
-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Intervenants can update rapport for assigned missions" ON demandes_etudes;

-- Allow intervenants to update rapport fields for missions they are assigned to
CREATE POLICY "Intervenants can update rapport for assigned missions" ON demandes_etudes
FOR UPDATE USING (
  auth.uid() IN (
    SELECT user_id FROM profiles WHERE type_compte = 'intervention'
  )
  AND (
    intervenant_id::uuid = auth.uid() 
    OR (intervenant_id IS NULL AND statut = 'en_attente')
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM profiles WHERE type_compte = 'intervention'
  )
  AND (
    intervenant_id::uuid = auth.uid() 
    OR (intervenant_id IS NULL AND statut = 'en_attente')
  )
);
