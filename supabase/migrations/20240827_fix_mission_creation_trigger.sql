-- Correction du trigger de création de mission pour gérer le cas où il n'y a pas d'intervenant

-- Supprimer l'ancien trigger et fonction
DROP TRIGGER IF EXISTS create_mission_on_demande_creation_trigger ON demandes_etudes;
DROP FUNCTION IF EXISTS create_mission_on_demande_creation();

-- Créer une fonction améliorée qui gère le cas où il n'y a pas d'intervenant
CREATE OR REPLACE FUNCTION create_mission_on_demande_creation()
RETURNS TRIGGER AS $$
DECLARE
    random_intervenant_id UUID;
BEGIN
    -- Sélectionner un intervenant aléatoire
    SELECT id INTO random_intervenant_id 
    FROM profiles 
    WHERE type_compte = 'intervention' 
    ORDER BY RANDOM() 
    LIMIT 1;
    
    -- Créer une mission seulement si un intervenant est trouvé
    -- Si pas d'intervenant, la mission sera créée plus tard manuellement
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
    ELSE
        -- Optionnel: créer une mission sans intervenant assigné
        -- qui pourra être assignée plus tard
        INSERT INTO missions (
            demande_etude_id,
            intervenant_id,
            statut,
            date_debut,
            date_fin
        ) VALUES (
            NEW.id,
            NULL,  -- Pas d'intervenant pour le moment
            'assignée',
            NOW(),
            NOW() + INTERVAL '7 days'
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, logger mais ne pas bloquer l'insertion de la demande_etude
        RAISE WARNING 'Erreur lors de la création de la mission: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
CREATE TRIGGER create_mission_on_demande_creation_trigger
    AFTER INSERT ON demandes_etudes
    FOR EACH ROW
    EXECUTE FUNCTION create_mission_on_demande_creation();

-- Permettre intervenant_id NULL dans la table missions
ALTER TABLE missions ALTER COLUMN intervenant_id DROP NOT NULL;
