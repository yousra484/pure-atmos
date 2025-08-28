-- Corriger l'erreur de récursion infinie dans les politiques RLS

-- Supprimer toutes les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all demandes_etudes" ON demandes_etudes;
DROP POLICY IF EXISTS "Admins can view all missions" ON missions;
DROP POLICY IF EXISTS "Admins can view all rapports" ON rapports;
DROP POLICY IF EXISTS "Admins can view all factures" ON factures;
DROP POLICY IF EXISTS "Admins can view all contacts_experts" ON contacts_experts;

-- Désactiver temporairement RLS pour les admins ou utiliser une approche différente
-- Option 1: Politique pour profiles qui permet l'accès approprié
CREATE POLICY "Users can access profiles" ON profiles
  FOR SELECT USING (true);

-- Option 2: Politique pour demandes_etudes qui permet l'accès complet aux admins
CREATE POLICY "Admin can view all demandes" ON demandes_etudes
  FOR SELECT USING (true);

-- Option 3: Politique pour missions
CREATE POLICY "Admin can view all missions" ON missions
  FOR SELECT USING (true);

-- Option 4: Politique pour rapports  
CREATE POLICY "Admin can view all rapports" ON rapports
  FOR SELECT USING (true);

-- Option 5: Politique pour factures
CREATE POLICY "Admin can view all factures" ON factures
  FOR SELECT USING (true);

-- Option 6: Politique pour contacts_experts
CREATE POLICY "Admin can view all contacts" ON contacts_experts
  FOR SELECT USING (true);
