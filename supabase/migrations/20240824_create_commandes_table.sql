-- Create commandes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.commandes (
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
DROP POLICY IF EXISTS "Clients can read their own orders" ON public.commandes;
DROP POLICY IF EXISTS "Clients can create orders" ON public.commandes;
DROP POLICY IF EXISTS "Clients can update their own orders" ON public.commandes;

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

-- Add indexes
CREATE INDEX IF NOT EXISTS commandes_client_id_idx ON public.commandes(client_id);
CREATE INDEX IF NOT EXISTS commandes_statut_idx ON public.commandes(statut);
CREATE INDEX IF NOT EXISTS commandes_created_at_idx ON public.commandes(created_at);

-- Add updated_at trigger for commandes
CREATE TRIGGER handle_commandes_updated_at
    BEFORE UPDATE ON public.commandes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
