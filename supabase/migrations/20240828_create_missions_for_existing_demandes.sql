-- Migration pour créer des missions pour toutes les demandes_etudes existantes

-- D'abord, ajouter la colonne demande_etude_id à la table missions si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'demande_etude_id') THEN
        ALTER TABLE public.missions ADD COLUMN demande_etude_id UUID REFERENCES public.demandes_etudes(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Créer un profil intervenant par défaut s'il n'en existe pas
INSERT INTO profiles (id, user_id, nom, prenom, email, type_compte, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'Intervenant',
    'Par Défaut',
    'intervenant@atmos.com',
    'intervention',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE type_compte = 'intervention'
);

-- Créer des missions pour toutes les demandes_etudes qui n'en ont pas
INSERT INTO missions (
    demande_etude_id,
    intervenant_id,
    statut,
    date_debut,
    date_fin
)
SELECT 
    de.id,
    (SELECT id FROM profiles WHERE type_compte = 'intervention' LIMIT 1),
    CASE 
        WHEN de.statut = 'en_attente' THEN 'assignée'
        WHEN de.statut = 'active' THEN 'en_cours'
        WHEN de.statut = 'termine' THEN 'terminée'
        WHEN de.statut = 'annule' THEN 'annulée'
        ELSE 'assignée'
    END,
    NOW(),
    NOW() + INTERVAL '7 days'
FROM demandes_etudes de
WHERE NOT EXISTS (
    SELECT 1 FROM missions m WHERE m.demande_etude_id = de.id
);

-- Recréer les triggers avec une meilleure gestion d'erreur
DROP TRIGGER IF EXISTS create_mission_on_demande_creation_trigger ON demandes_etudes;
DROP FUNCTION IF EXISTS create_mission_on_demande_creation();

CREATE OR REPLACE FUNCTION create_mission_on_demande_creation()
RETURNS TRIGGER AS $$
DECLARE
    intervenant_id UUID;
BEGIN
    -- Sélectionner un intervenant
    SELECT id INTO intervenant_id 
    FROM profiles 
    WHERE type_compte = 'intervention' 
    ORDER BY RANDOM() 
    LIMIT 1;
    
    -- Si pas d'intervenant, créer un profil par défaut
    IF intervenant_id IS NULL THEN
        INSERT INTO profiles (id, user_id, nom, prenom, email, type_compte, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            gen_random_uuid(),
            'Intervenant',
            'Automatique',
            'auto-intervenant@atmos.com',
            'intervention',
            NOW(),
            NOW()
        )
        RETURNING id INTO intervenant_id;
    END IF;
    
    -- Créer la mission
    INSERT INTO missions (
        demande_etude_id,
        intervenant_id,
        statut,
        date_debut,
        date_fin
    ) VALUES (
        NEW.id,
        intervenant_id,
        'assignée',
        NOW(),
        NOW() + INTERVAL '7 days'
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- En cas d'erreur, logger mais continuer
        RAISE WARNING 'Erreur création mission pour demande %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
CREATE TRIGGER create_mission_on_demande_creation_trigger
    AFTER INSERT ON demandes_etudes
    FOR EACH ROW
    EXECUTE FUNCTION create_mission_on_demande_creation();
