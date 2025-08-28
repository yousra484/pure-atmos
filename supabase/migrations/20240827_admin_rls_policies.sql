-- Politique RLS pour permettre aux admins d'accéder à toutes les données

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all demandes_etudes" ON demandes_etudes;

-- Politique pour la table profiles (éviter la récursion)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    user_id = auth.uid() OR 
    (
      SELECT type_compte FROM profiles 
      WHERE user_id = auth.uid() 
      LIMIT 1
    ) = 'admin'
  );

-- Politique pour la table demandes_etudes
CREATE POLICY "Admins can view all demandes_etudes" ON demandes_etudes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.user_id = auth.uid() 
      AND admin_profile.type_compte = 'admin'
    )
  );

-- Politique pour la table missions
CREATE POLICY "Admins can view all missions" ON missions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.user_id = auth.uid() 
      AND admin_profile.type_compte = 'admin'
    )
  );

-- Politique pour la table rapports
CREATE POLICY "Admins can view all rapports" ON rapports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.user_id = auth.uid() 
      AND admin_profile.type_compte = 'admin'
    )
  );

-- Politique pour la table factures
CREATE POLICY "Admins can view all factures" ON factures
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.user_id = auth.uid() 
      AND admin_profile.type_compte = 'admin'
    )
  );

-- Politique pour la table contacts_experts
CREATE POLICY "Admins can view all contacts_experts" ON contacts_experts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profile 
      WHERE admin_profile.user_id = auth.uid() 
      AND admin_profile.type_compte = 'admin'
    )
  );
