-- Add missing columns to demandes_etudes table
-- This migration adds the columns that are referenced in the Dashboard but don't exist yet

ALTER TABLE public.demandes_etudes 
ADD COLUMN IF NOT EXISTS date_acceptation timestamp with time zone null;

-- Update RLS policies to ensure they work with the new column structure
-- (The existing policies should already handle these columns, but let's make sure)

-- Refresh the table structure
COMMENT ON COLUMN public.demandes_etudes.date_acceptation IS 'Date when the study was accepted by an intervenant';
