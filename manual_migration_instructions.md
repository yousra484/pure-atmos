# Migration Manuelle - Suppression de la table commandes

Puisque les commandes Supabase CLI ne sont pas disponibles dans cet environnement, voici les instructions pour appliquer manuellement la migration.

## Étapes à suivre:

### 1. Accéder à votre dashboard Supabase
- Connectez-vous à https://supabase.com/dashboard
- Sélectionnez votre projet
- Allez dans "SQL Editor"

### 2. Exécuter le script de migration
Copiez et exécutez le contenu du fichier `supabase/migrations/20240825_remove_commandes_use_demandes_etudes.sql` dans l'éditeur SQL.

### 3. Vérifications après migration
Après avoir exécuté la migration, vérifiez:

```sql
-- Vérifier que la colonne a été renommée
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'missions' AND column_name = 'demande_etude_id';

-- Vérifier que la table commandes n'existe plus
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'commandes';

-- Tester la création automatique de mission
UPDATE demandes_etudes SET statut = 'accepte' WHERE id = 'some-test-id';
```

### 4. Régénérer les types TypeScript
Après la migration, régénérez les types Supabase:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

## Ce que fait cette migration:

1. **Supprime la table `commandes`** et tous ses objets liés
2. **Renomme `commande_id` en `demande_etude_id`** dans la table `missions`
3. **Crée de nouveaux triggers** pour la synchronisation automatique:
   - Création automatique de mission quand `demandes_etudes.statut = 'accepte'`
   - Synchronisation des statuts entre missions et demandes_etudes
4. **Met à jour les politiques RLS** pour utiliser `demandes_etudes`
5. **Ajoute un index** pour optimiser les performances

## Workflow après migration:

1. **Client crée une demande d'étude** via le formulaire
2. **Admin accepte la demande** → `statut = 'accepte'`
3. **Mission créée automatiquement** et assignée à un intervenant
4. **Synchronisation des statuts** entre mission et demande d'étude
