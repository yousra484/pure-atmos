-- Create function to automatically create mission when order is created
CREATE OR REPLACE FUNCTION public.create_mission_for_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create mission for orders that need field intervention
  IF NEW.statut = 'confirme' AND OLD.statut IS DISTINCT FROM NEW.statut THEN
    INSERT INTO public.missions (
      commande_id,
      intervenant_id,
      statut,
      date_debut,
      lieu_intervention,
      description,
      created_at
    )
    VALUES (
      NEW.id,
      -- Assign to first available intervenant (you can modify this logic)
      (SELECT id FROM public.profiles WHERE type_compte = 'intervention' LIMIT 1),
      'en_attente',
      NOW() + INTERVAL '1 day', -- Schedule for next day
      NEW.lieu_intervention,
      'Mission automatiquement créée pour la commande: ' || NEW.titre,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic mission creation
DROP TRIGGER IF EXISTS create_mission_on_order_confirm ON public.commandes;
CREATE TRIGGER create_mission_on_order_confirm
  AFTER INSERT OR UPDATE ON public.commandes
  FOR EACH ROW
  WHEN (NEW.statut = 'confirme')
  EXECUTE FUNCTION public.create_mission_for_order();

-- Create function to sync mission status with order status
CREATE OR REPLACE FUNCTION public.sync_order_status_from_mission()
RETURNS TRIGGER AS $$
BEGIN
  -- Update order status based on mission status
  UPDATE public.commandes 
  SET statut = CASE 
    WHEN NEW.statut = 'en_attente' THEN 'en_cours'
    WHEN NEW.statut = 'en_cours' THEN 'active'
    WHEN NEW.statut = 'termine' THEN 'termine'
    WHEN NEW.statut = 'annule' THEN 'annule'
    ELSE statut
  END,
  updated_at = NOW()
  WHERE id = NEW.commande_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for mission to order status sync
DROP TRIGGER IF EXISTS sync_order_on_mission_update ON public.missions;
CREATE TRIGGER sync_order_on_mission_update
  AFTER UPDATE ON public.missions
  FOR EACH ROW
  WHEN (OLD.statut IS DISTINCT FROM NEW.statut)
  EXECUTE FUNCTION public.sync_order_status_from_mission();

-- Create function to handle order cancellation
CREATE OR REPLACE FUNCTION public.cancel_mission_on_order_cancel()
RETURNS TRIGGER AS $$
BEGIN
  -- Cancel associated missions when order is cancelled
  IF NEW.statut = 'annule' AND OLD.statut != 'annule' THEN
    UPDATE public.missions 
    SET statut = 'annule',
        updated_at = NOW()
    WHERE commande_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order cancellation
DROP TRIGGER IF EXISTS cancel_mission_on_order_cancel ON public.commandes;
CREATE TRIGGER cancel_mission_on_order_cancel
  AFTER UPDATE ON public.commandes
  FOR EACH ROW
  WHEN (NEW.statut = 'annule' AND OLD.statut != 'annule')
  EXECUTE FUNCTION public.cancel_mission_on_order_cancel();

-- Update missions table to ensure proper status values
DO $$
BEGIN
  -- Add constraint for mission status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'missions_statut_check' 
    AND table_name = 'missions'
  ) THEN
    ALTER TABLE public.missions 
    ADD CONSTRAINT missions_statut_check 
    CHECK (statut IN ('en_attente', 'en_cours', 'termine', 'annule'));
  END IF;
END $$;

-- Update commandes table to ensure proper status values
DO $$
BEGIN
  -- Add constraint for order status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'commandes_statut_check' 
    AND table_name = 'commandes'
  ) THEN
    ALTER TABLE public.commandes 
    ADD CONSTRAINT commandes_statut_check 
    CHECK (statut IN ('en_attente', 'confirme', 'en_cours', 'active', 'termine', 'annule'));
  END IF;
END $$;

-- Add lieu_intervention column to commandes if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'commandes' AND column_name = 'lieu_intervention') THEN
        ALTER TABLE public.commandes ADD COLUMN lieu_intervention TEXT;
    END IF;
END $$;
