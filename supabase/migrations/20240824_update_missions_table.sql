-- Update missions table to include missing columns for intervenant functionality
DO $$ 
BEGIN
    -- Add lieu_intervention column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'lieu_intervention') THEN
        ALTER TABLE public.missions ADD COLUMN lieu_intervention TEXT;
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'description') THEN
        ALTER TABLE public.missions ADD COLUMN description TEXT;
    END IF;
    
    -- Add latitude column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'latitude') THEN
        ALTER TABLE public.missions ADD COLUMN latitude DECIMAL(10, 8);
    END IF;
    
    -- Add longitude column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'longitude') THEN
        ALTER TABLE public.missions ADD COLUMN longitude DECIMAL(11, 8);
    END IF;
    
    -- Add notes_terrain column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'notes_terrain') THEN
        ALTER TABLE public.missions ADD COLUMN notes_terrain TEXT;
    END IF;
    
    -- Add precision_gps column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'missions' AND column_name = 'precision_gps') THEN
        ALTER TABLE public.missions ADD COLUMN precision_gps DECIMAL(8, 2);
    END IF;
END $$;

-- Create missions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    commande_id UUID REFERENCES public.commandes(id) ON DELETE CASCADE,
    intervenant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    statut TEXT DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'en_cours', 'termine', 'annule')),
    date_debut TIMESTAMP WITH TIME ZONE,
    date_fin TIMESTAMP WITH TIME ZONE,
    lieu_intervention TEXT,
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    notes_terrain TEXT,
    precision_gps DECIMAL(8, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for missions
DROP POLICY IF EXISTS "Intervenants can read their missions" ON public.missions;
DROP POLICY IF EXISTS "Intervenants can update their missions" ON public.missions;

CREATE POLICY "Intervenants can read their missions" ON public.missions
    FOR SELECT USING (
        intervenant_id IN (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Intervenants can update their missions" ON public.missions
    FOR UPDATE USING (
        intervenant_id IN (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()
        )
    );

-- Add indexes
CREATE INDEX IF NOT EXISTS missions_intervenant_id_idx ON public.missions(intervenant_id);
CREATE INDEX IF NOT EXISTS missions_statut_idx ON public.missions(statut);
CREATE INDEX IF NOT EXISTS missions_date_debut_idx ON public.missions(date_debut);

-- Add updated_at trigger for missions
CREATE TRIGGER handle_missions_updated_at
    BEFORE UPDATE ON public.missions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
