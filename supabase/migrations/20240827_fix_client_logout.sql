-- Corriger le problème de déconnexion des clients en ajustant les politiques RLS

-- Supprimer les politiques problématiques
DROP POLICY IF EXISTS "Admin and own profile access" ON profiles;
DROP POLICY IF EXISTS "Users can access profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Créer une politique plus permissive pour profiles qui permet la déconnexion
CREATE POLICY "Allow profile access for authentication" ON profiles
  FOR SELECT USING (true);

-- Ajouter une politique pour les mises à jour de profil (nécessaire pour certaines opérations)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Ajouter une politique pour l'insertion de nouveaux profils
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());
