-- Fix commandes table schema to match frontend expectations
-- Drop existing table if it exists and recreate with correct structure
DROP TABLE IF EXISTS public.commandes CASCADE;

-- Create commandes table with all required columns
CREATE TABLE public.commandes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    titre TEXT NOT NULL,
    type_etude TEXT NOT NULL,
    description TEXT,
    urgence TEXT DEFAULT 'normale' CHECK (urgence IN ('faible', 'normale', 'elevee', 'critique')),
    zone_geographique TEXT,
    parametres_analyses TEXT[], -- Array of analysis parameters
    echantillons_requis INTEGER DEFAULT 1,
    rapport_langue TEXT DEFAULT 'fr' CHECK (rapport_langue IN ('fr', 'en', 'ar')),
    budget DECIMAL(10, 2),
    delai_souhaite INTEGER, -- en jours
    lieu_intervention TEXT,
    statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'confirme', 'en_cours', 'active', 'termine', 'annule')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for commandes
CREATE POLICY "Clients can read their own orders" ON public.commandes
    FOR SELECT USING (
        client_id IN (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Clients can create orders" ON public.commandes
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Clients can update their own orders" ON public.commandes
    FOR UPDATE USING (
        client_id IN (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- Allow intervenants to read orders for missions
CREATE POLICY "Intervenants can read orders for their missions" ON public.commandes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.missions m
            JOIN public.profiles p ON m.intervenant_id = p.id
            WHERE m.commande_id = commandes.id 
            AND p.user_id = auth.uid()
        )
    );

-- Add indexes
CREATE INDEX commandes_client_id_idx ON public.commandes(client_id);
CREATE INDEX commandes_statut_idx ON public.commandes(statut);
CREATE INDEX commandes_created_at_idx ON public.commandes(created_at);
CREATE INDEX commandes_type_etude_idx ON public.commandes(type_etude);

-- Add updated_at trigger
CREATE TRIGGER handle_commandes_updated_at
    BEFORE UPDATE ON public.commandes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert some test data
INSERT INTO public.commandes (
    client_id,
    titre,
    type_etude,
    description,
    urgence,
    zone_geographique,
    parametres_analyses,
    echantillons_requis,
    rapport_langue,
    budget,
    delai_souhaite,
    lieu_intervention,
    statut
) VALUES (
    (SELECT id FROM public.profiles WHERE type_compte = 'client' LIMIT 1),
    'Analyse qualité air - Bureau Test',
    'qualite_air_interieur',
    'Analyse complète de la qualité de l''air dans les bureaux',
    'normale',
    'Alger Centre',
    ARRAY['CO2', 'PM2.5', 'PM10', 'COV'],
    3,
    'fr',
    2500.00,
    7,
    '123 Rue Test, Alger',
    'confirme'
) ON CONFLICT DO NOTHING;
