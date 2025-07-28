-- Table pour les demandes d'études
CREATE TABLE public.demandes_etudes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  nom_entreprise TEXT NOT NULL,
  secteur_activite TEXT NOT NULL,
  type_etude TEXT NOT NULL,
  description_projet TEXT NOT NULL,
  zone_geographique TEXT NOT NULL,
  budget_estime TEXT,
  delai_souhaite TEXT,
  contact_nom TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_telephone TEXT,
  statut TEXT NOT NULL DEFAULT 'en_attente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les demandes de contact expert
CREATE TABLE public.contacts_experts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  entreprise TEXT,
  sujet TEXT NOT NULL,
  message TEXT NOT NULL,
  type_consultation TEXT NOT NULL,
  urgence TEXT NOT NULL DEFAULT 'normale',
  statut TEXT NOT NULL DEFAULT 'nouveau',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.demandes_etudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts_experts ENABLE ROW LEVEL SECURITY;

-- Policies pour demandes_etudes
CREATE POLICY "Users can view their own study requests" 
ON public.demandes_etudes 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Users can create their own study requests" 
ON public.demandes_etudes 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own study requests" 
ON public.demandes_etudes 
FOR UPDATE 
USING (auth.uid() = client_id);

-- Policies pour contacts_experts
CREATE POLICY "Users can view their own expert contacts" 
ON public.contacts_experts 
FOR SELECT 
USING (auth.uid() = client_id OR client_id IS NULL);

CREATE POLICY "Anyone can create expert contact requests" 
ON public.contacts_experts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own expert contacts" 
ON public.contacts_experts 
FOR UPDATE 
USING (auth.uid() = client_id);

-- Triggers pour mise à jour automatique des timestamps
CREATE TRIGGER update_demandes_etudes_updated_at
BEFORE UPDATE ON public.demandes_etudes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contacts_experts_updated_at
BEFORE UPDATE ON public.contacts_experts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();