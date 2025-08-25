# Guide : Exécuter le script SQL dans Supabase Dashboard

## Étapes détaillées pour appliquer la migration

### 1. Accéder au Dashboard Supabase
1. Ouvrez votre navigateur et allez sur **https://supabase.com/dashboard**
2. Connectez-vous avec vos identifiants
3. Sélectionnez votre projet dans la liste des projets

### 2. Ouvrir l'éditeur SQL
1. Dans le menu latéral gauche, cliquez sur **"SQL Editor"**
2. Vous verrez l'interface de l'éditeur SQL avec un espace pour écrire vos requêtes

### 3. Copier le script de migration
1. Ouvrez le fichier `supabase/migrations/20240825_remove_commandes_use_demandes_etudes.sql`
2. Sélectionnez tout le contenu du fichier (Ctrl+A)
3. Copiez le contenu (Ctrl+C)

### 4. Exécuter le script
1. Dans l'éditeur SQL de Supabase, collez le script (Ctrl+V)
2. Cliquez sur le bouton **"Run"** (ou utilisez Ctrl+Enter)
3. Attendez que l'exécution se termine

### 5. Vérifier l'exécution
Après l'exécution, vous devriez voir :
- ✅ Messages de succès pour chaque opération
- ❌ Aucun message d'erreur rouge

### 6. Vérifications post-migration
Exécutez ces requêtes pour vérifier que tout fonctionne :

```sql
-- Vérifier que la colonne a été renommée
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'missions' AND column_name = 'demande_etude_id';

-- Vérifier que la table commandes n'existe plus
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'commandes' AND table_schema = 'public';

-- Vérifier les triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%demande%';
```

### 7. Tester la création automatique
Pour tester le système :

```sql
-- Créer une demande d'étude test
INSERT INTO demandes_etudes (
  client_id, 
  nom_entreprise, 
  type_etude, 
  zone_geographique, 
  statut
) VALUES (
  (SELECT id FROM profiles WHERE type_compte = 'client' LIMIT 1),
  'Test Entreprise',
  'qualite_air_interieur',
  'Alger, Algérie',
  'en_attente'
);

-- Accepter la demande (cela devrait créer une mission automatiquement)
UPDATE demandes_etudes 
SET statut = 'accepte' 
WHERE nom_entreprise = 'Test Entreprise';

-- Vérifier qu'une mission a été créée
SELECT * FROM missions 
WHERE demande_etude_id IN (
  SELECT id FROM demandes_etudes WHERE nom_entreprise = 'Test Entreprise'
);
```

## Résolution des erreurs courantes

### Erreur : "relation commandes does not exist"
- ✅ Normal si la table commandes a déjà été supprimée
- Continuez l'exécution du script

### Erreur : "column commande_id does not exist"
- ✅ Normal si la colonne a déjà été renommée
- Continuez l'exécution du script

### Erreur de permissions
- Assurez-vous d'être connecté en tant qu'administrateur du projet
- Vérifiez que vous avez les droits d'écriture sur la base de données

## Après la migration

1. **Régénérer les types TypeScript** (optionnel) :
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
   ```

2. **Tester l'application** :
   - Créer une nouvelle demande d'étude
   - Vérifier que le statut se synchronise correctement
   - Tester l'assignation automatique des missions

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs d'erreur dans l'éditeur SQL
2. Consultez la documentation Supabase
3. Contactez le support technique si nécessaire
