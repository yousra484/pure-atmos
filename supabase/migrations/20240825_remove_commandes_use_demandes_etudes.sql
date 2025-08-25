-- Migration to remove commandes table and use only demandes_etudes
-- Update missions table to reference demandes_etudes instead of commandes

-- First, drop existing triggers and functions that reference commandes
DROP TRIGGER IF EXISTS create_mission_on_order_confirm ON commandes;
DROP TRIGGER IF EXISTS sync_mission_order_status ON missions;
DROP FUNCTION IF EXISTS create_mission_for_order();
DROP FUNCTION IF EXISTS sync_order_mission_status();

-- Update missions table to reference demandes_etudes
ALTER TABLE missions 
DROP CONSTRAINT IF EXISTS missions_commande_id_fkey;

ALTER TABLE missions 
RENAME COLUMN commande_id TO demande_etude_id;

ALTER TABLE missions 
ADD CONSTRAINT missions_demande_etude_id_fkey 
FOREIGN KEY (demande_etude_id) REFERENCES demandes_etudes(id) ON DELETE CASCADE;

-- Create function to automatically create mission when demande_etude is accepted
CREATE OR REPLACE FUNCTION create_mission_for_demande_etude()
RETURNS TRIGGER AS $$
DECLARE
    random_intervenant_id UUID;
BEGIN
    -- Only create mission when status changes to 'accepte'
    IF NEW.statut = 'accepte' AND (OLD.statut IS NULL OR OLD.statut != 'accepte') THEN
        -- Get a random intervenant (for now, in production you'd have proper assignment logic)
        SELECT id INTO random_intervenant_id 
        FROM profiles 
        WHERE type_compte = 'intervention' 
        ORDER BY RANDOM() 
        LIMIT 1;
        
        -- Create mission if we found an intervenant
        IF random_intervenant_id IS NOT NULL THEN
            INSERT INTO missions (
                demande_etude_id,
                intervenant_id,
                statut,
                created_at,
                updated_at
            ) VALUES (
                NEW.id,
                random_intervenant_id,
                'en_attente',
                NOW(),
                NOW()
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to sync demande_etude status when mission status changes
CREATE OR REPLACE FUNCTION sync_demande_mission_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update demande_etude status based on mission status
    IF NEW.statut = 'en_cours' THEN
        UPDATE demandes_etudes 
        SET statut = 'en_cours' 
        WHERE id = NEW.demande_etude_id;
    ELSIF NEW.statut = 'termine' THEN
        UPDATE demandes_etudes 
        SET statut = 'termine' 
        WHERE id = NEW.demande_etude_id;
    ELSIF NEW.statut = 'annule' THEN
        UPDATE demandes_etudes 
        SET statut = 'annule' 
        WHERE id = NEW.demande_etude_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER create_mission_on_demande_accept
    AFTER UPDATE ON demandes_etudes
    FOR EACH ROW
    EXECUTE FUNCTION create_mission_for_demande_etude();

CREATE TRIGGER sync_mission_demande_status
    AFTER UPDATE ON missions
    FOR EACH ROW
    EXECUTE FUNCTION sync_demande_mission_status();

-- Handle cancellation: when demande_etude is cancelled, cancel related mission
CREATE OR REPLACE FUNCTION handle_demande_cancellation()
RETURNS TRIGGER AS $$
BEGIN
    -- If demande_etude is cancelled, cancel the mission
    IF NEW.statut = 'annule' AND (OLD.statut IS NULL OR OLD.statut != 'annule') THEN
        UPDATE missions 
        SET statut = 'annule' 
        WHERE demande_etude_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_demande_cancellation_trigger
    AFTER UPDATE ON demandes_etudes
    FOR EACH ROW
    EXECUTE FUNCTION handle_demande_cancellation();

-- Drop commandes table and related objects
DROP TABLE IF EXISTS commandes CASCADE;

-- Update RLS policies for missions to work with demandes_etudes
DROP POLICY IF EXISTS "Users can view their own missions" ON missions;
DROP POLICY IF EXISTS "Intervenants can view their assigned missions" ON missions;
DROP POLICY IF EXISTS "Intervenants can update their missions" ON missions;

-- Create new RLS policies
CREATE POLICY "Clients can view missions for their demandes_etudes" ON missions
    FOR SELECT USING (
        demande_etude_id IN (
            SELECT de.id FROM demandes_etudes de
            JOIN profiles p ON p.id = de.client_id
            WHERE p.user_id = auth.uid()
        )
    );

CREATE POLICY "Intervenants can view their assigned missions" ON missions
    FOR SELECT USING (
        intervenant_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid() AND type_compte = 'intervention'
        )
    );

CREATE POLICY "Intervenants can update their missions" ON missions
    FOR UPDATE USING (
        intervenant_id IN (
            SELECT id FROM profiles 
            WHERE user_id = auth.uid() AND type_compte = 'intervention'
        )
    );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_missions_demande_etude_id ON missions(demande_etude_id);
