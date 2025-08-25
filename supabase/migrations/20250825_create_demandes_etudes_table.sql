-- Create demandes_etudes table with correct structure
DROP TABLE IF EXISTS public.demandes_etudes CASCADE;

-- Create the demandes_etudes table
CREATE TABLE public.demandes_etudes (
  id uuid not null default gen_random_uuid(),
  client_id uuid not null,
  nom_entreprise text not null,
  secteur_activite text not null,
  type_etude text not null,
  description_projet text not null,
  zone_geographique text not null,
  budget_estime text null,
  delai_souhaite text null,
  contact_nom text not null,
  contact_email text not null,
  contact_telephone text null,
  statut text not null default 'en_attente'::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  intervenant_id uuid null, 
  date_acceptation timestamp with time zone null,
  date_debut_mission timestamp with time zone null,
  date_fin_mission timestamp with time zone null,
  notes_terrain text null,
  latitude numeric(10, 8) null,
  longitude numeric(11, 8) null,
  constraint demandes_etudes_pkey primary key (id),
  constraint demandes_etudes_statut_check check (
    statut = any (
      array[
        'en_attente'::text,
        'acceptée'::text,
        'en_cours'::text,
        'terminée'::text,
        'annulée'::text
      ]
    )
  )
) tablespace pg_default;

-- Create indexes
CREATE INDEX IF NOT EXISTS demandes_etudes_intervenant_id_idx ON public.demandes_etudes USING btree (intervenant_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS demandes_etudes_statut_idx ON public.demandes_etudes USING btree (statut) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS demandes_etudes_statut_intervenant_idx ON public.demandes_etudes USING btree (statut, intervenant_id) TABLESPACE pg_default;

-- Create update trigger
CREATE TRIGGER update_demandes_etudes_updated_at 
  BEFORE UPDATE ON demandes_etudes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.demandes_etudes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Clients can view their own demandes" ON public.demandes_etudes
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create demandes" ON public.demandes_etudes
  FOR INSERT WITH CHECK (
    client_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can update their own demandes" ON public.demandes_etudes
  FOR UPDATE USING (
    client_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Intervenants can view assigned demandes" ON public.demandes_etudes
  FOR SELECT USING (
    intervenant_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid() AND type_compte = 'intervention'
    )
  );

CREATE POLICY "Intervenants can update assigned demandes" ON public.demandes_etudes
  FOR UPDATE USING (
    intervenant_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid() AND type_compte = 'intervention'
    )
  );
