-- Migration: Create mission-reports storage bucket for PDF reports
-- Date: 2025-08-26
-- Description: Creates storage bucket and policies for PDF report uploads

-- Create the mission-reports bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('mission-reports', 'mission-reports', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Intervenants can upload reports" ON storage.objects;
DROP POLICY IF EXISTS "Intervenants can view reports" ON storage.objects;
DROP POLICY IF EXISTS "Intervenants can update own reports" ON storage.objects;
DROP POLICY IF EXISTS "Intervenants can delete own reports" ON storage.objects;

-- Create policy to allow intervenants to upload reports
CREATE POLICY "Intervenants can upload reports" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'mission-reports' AND
  auth.uid()::text IN (
    SELECT user_id::text FROM profiles WHERE type_compte = 'intervention'
  )
);

-- Create policy to allow intervenants to view reports
CREATE POLICY "Intervenants can view reports" ON storage.objects
FOR SELECT USING (
  bucket_id = 'mission-reports' AND
  auth.uid()::text IN (
    SELECT user_id::text FROM profiles WHERE type_compte = 'intervention'
  )
);

-- Create policy to allow intervenants to update their own reports
CREATE POLICY "Intervenants can update own reports" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'mission-reports' AND
  auth.uid()::text IN (
    SELECT user_id::text FROM profiles WHERE type_compte = 'intervention'
  ) AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow intervenants to delete their own reports
CREATE POLICY "Intervenants can delete own reports" ON storage.objects
FOR DELETE USING (
  bucket_id = 'mission-reports' AND
  auth.uid()::text IN (
    SELECT user_id::text FROM profiles WHERE type_compte = 'intervention'
  ) AND
  (storage.foldername(name))[1] = auth.uid()::text
);
