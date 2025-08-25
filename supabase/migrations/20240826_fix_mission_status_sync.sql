-- Migration pour corriger la synchronisation des statuts entre demandes_etudes et missions

-- D'abord, supprimer les triggers existants
DROP TRIGGER IF EXISTS create_mission_on_demande_accept ON demandes_etudes;
DROP TRIGGER IF EXISTS sync_mission_demande_status ON missions;
DROP FUNCTION IF EXISTS create_mission_for_demande_etude();
DROP FUNCTION IF EXISTS sync_demande_mission_status();

-- Mettre à jour la contrainte de statut dans la table missions pour accepter les bons statuts
ALTER TABLE missions DROP CONSTRAINT IF EXISTS missions_statut_check;
ALTER TABLE missions ADD CONSTRAINT missions_statut_check 
CHECK (statut IN ('assignée', 'en_cours', 'terminée', 'annulée'));

-- Créer la fonction pour créer automatiquement une mission quand une demande_etude est créée
CREATE OR REPLACE FUNCTION create_mission_on_demande_creation()
RETURNS TRIGGER AS $$
DECLARE
    random_intervenant_id UUID;
BEGIN
    -- Sélectionner un intervenant aléatoire (en production, utiliser une logique d'assignation appropriée)
    SELECT id INTO random_intervenant_id 
    FROM profiles 
    WHERE type_compte = 'intervention' 
    ORDER BY RANDOM() 
    LIMIT 1;
    
    -- Créer une mission avec le statut 'assignée'
    IF random_intervenant_id IS NOT NULL THEN
        INSERT INTO missions (
            demande_etude_id,
            intervenant_id,
            statut,
            date_debut,
            date_fin
        ) VALUES (
            NEW.id,
            random_intervenant_id,
            'assignée',
            NOW(),
            NOW() + INTERVAL '7 days'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer la fonction pour synchroniser les statuts mission -> demande_etude
CREATE OR REPLACE FUNCTION sync_mission_to_demande_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le statut de la demande_etude selon le statut de la mission
    IF NEW.statut = 'en_cours' THEN
        UPDATE demandes_etudes 
        SET statut = 'active',
            updated_at = NOW()
        WHERE id = NEW.demande_etude_id;
    ELSIF NEW.statut = 'terminée' THEN
        UPDATE demandes_etudes 
        SET statut = 'termine',
            updated_at = NOW()
        WHERE id = NEW.demande_etude_id;
    ELSIF NEW.statut = 'annulée' THEN
        UPDATE demandes_etudes 
        SET statut = 'annule',
            updated_at = NOW()
        WHERE id = NEW.demande_etude_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour créer une mission lors de la création d'une demande_etude
CREATE TRIGGER create_mission_on_demande_creation_trigger
    AFTER INSERT ON demandes_etudes
    FOR EACH ROW
    EXECUTE FUNCTION create_mission_on_demande_creation();

-- Créer le trigger pour synchroniser les statuts mission -> demande_etude
CREATE TRIGGER sync_mission_to_demande_status_trigger
    AFTER UPDATE ON missions
    FOR EACH ROW
    WHEN (OLD.statut IS DISTINCT FROM NEW.statut)
    EXECUTE FUNCTION sync_mission_to_demande_status();

-- Ajouter les valeurs possibles pour le statut de demandes_etudes si nécessaire
ALTER TABLE demandes_etudes DROP CONSTRAINT IF EXISTS demandes_etudes_statut_check;
ALTER TABLE demandes_etudes ADD CONSTRAINT demandes_etudes_statut_check 
CHECK (statut IN ('en_attente', 'active', 'termine', 'annule'));

-- Mettre à jour les missions existantes qui ont un statut NULL
UPDATE missions SET statut = 'assignée' WHERE statut IS NULL;

-- Rendre la colonne statut NOT NULL maintenant que toutes les valeurs sont définies
ALTER TABLE missions ALTER COLUMN statut SET NOT NULL;
ALTER TABLE missions ALTER COLUMN statut SET DEFAULT 'assignée';
