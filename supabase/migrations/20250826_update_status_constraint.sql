-- Update the status constraint to include the new 'complete' status
-- This migration adds 'complete' to the allowed status values

-- Drop the existing constraint
ALTER TABLE public.demandes_etudes 
DROP CONSTRAINT IF EXISTS demandes_etudes_statut_check;

-- Add the new constraint with 'complete' status included
ALTER TABLE public.demandes_etudes 
ADD CONSTRAINT demandes_etudes_statut_check 
CHECK (
  statut = ANY (
    ARRAY[
      'en_attente'::text,
      'acceptée'::text,
      'en_cours'::text,
      'terminée'::text,
      'complete'::text,
      'annulée'::text
    ]
  )
);
