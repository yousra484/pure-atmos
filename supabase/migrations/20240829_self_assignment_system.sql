-- Migration pour système d'auto-assignation des intervenants
-- Les intervenants voient toutes les demandes et choisissent leurs missions

-- Ajouter colonnes d'assignation à demandes_etudes
ALTER TABLE demandes_etudes 
ADD COLUMN IF NOT EXISTS intervenant_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS date_acceptation TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS date_debut_mission TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS date_fin_mission TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS notes_terrain TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Mettre à jour les statuts possibles
ALTER TABLE demandes_etudes DROP CONSTRAINT IF EXISTS demandes_etudes_statut_check;
ALTER TABLE demandes_etudes ADD CONSTRAINT demandes_etudes_statut_check 
CHECK (statut IN ('en_attente', 'acceptée', 'en_cours', 'terminée', 'annulée'));

-- Supprimer l'ancienne table missions et ses triggers (si elle existe)
DROP TRIGGER IF EXISTS create_mission_on_demande_creation_trigger ON demandes_etudes;
DROP TRIGGER IF EXISTS sync_mission_to_demande_status_trigger ON missions;
DROP FUNCTION IF EXISTS create_mission_on_demande_creation();
DROP FUNCTION IF EXISTS sync_mission_to_demande_status();
DROP TABLE IF EXISTS missions CASCADE;

-- Politique RLS pour que les intervenants voient toutes les demandes en attente
DROP POLICY IF EXISTS "Intervenants can view all pending demandes" ON demandes_etudes;
CREATE POLICY "Intervenants can view all pending demandes" ON demandes_etudes
    FOR SELECT USING (
        -- Intervenants peuvent voir toutes les demandes en attente
        (statut = 'en_attente') OR
        -- Ou leurs propres demandes acceptées
        (intervenant_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid() AND type_compte = 'intervention'
        ))
    );

-- Politique pour que les intervenants puissent accepter des demandes
DROP POLICY IF EXISTS "Intervenants can accept demandes" ON demandes_etudes;
CREATE POLICY "Intervenants can accept demandes" ON demandes_etudes
    FOR UPDATE USING (
        -- Peuvent accepter des demandes en attente
        (statut = 'en_attente' AND intervenant_id IS NULL) OR
        -- Ou modifier leurs propres demandes
        (intervenant_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid() AND type_compte = 'intervention'
        ))
    );

-- Index pour les performances
CREATE INDEX IF NOT EXISTS demandes_etudes_intervenant_id_idx ON demandes_etudes(intervenant_id);
CREATE INDEX IF NOT EXISTS demandes_etudes_statut_idx ON demandes_etudes(statut);
CREATE INDEX IF NOT EXISTS demandes_etudes_statut_intervenant_idx ON demandes_etudes(statut, intervenant_id);
