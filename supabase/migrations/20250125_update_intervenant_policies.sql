-- Update RLS policies to allow intervenants to view all demandes_etudes
-- This enables the assignment workflow where intervenants can see and accept available studies

-- Drop existing intervenant policies
DROP POLICY IF EXISTS "Intervenants can view assigned demandes" ON public.demandes_etudes;
DROP POLICY IF EXISTS "Intervenants can update assigned demandes" ON public.demandes_etudes;

-- Create new policies for intervenants to view ALL demandes
CREATE POLICY "Intervenants can view all demandes" ON public.demandes_etudes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND type_compte = 'intervention'
    )
  );

-- Allow intervenants to update demandes they can assign to themselves or that are assigned to them
CREATE POLICY "Intervenants can update available and assigned demandes" ON public.demandes_etudes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND type_compte = 'intervention'
    ) AND (
      -- Can update if unassigned (for self-assignment)
      intervenant_id IS NULL 
      OR 
      -- Can update if assigned to them
      intervenant_id IN (
        SELECT id FROM public.profiles 
        WHERE user_id = auth.uid() AND type_compte = 'intervention'
      )
    )
  );
