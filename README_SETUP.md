# Setup Instructions pour résoudre les erreurs de base de données

## Problème identifié
L'erreur `column commandes_1.type_etude does not exist` indique que la table `commandes` n'existe pas ou n'a pas la bonne structure dans votre base de données Supabase.

## Solution étape par étape

### 1. Vérifier l'état de Supabase
```bash
# Vérifier si Supabase est en cours d'exécution
supabase status

# Si pas démarré, démarrer Supabase
supabase start
```

### 2. Appliquer les migrations dans l'ordre
```bash
# Réinitialiser la base de données
supabase db reset

# Ou appliquer manuellement les migrations
supabase db push
```

### 3. Migrations créées pour résoudre le problème

Les fichiers suivants ont été créés/mis à jour :

1. **20240824_create_commandes_table.sql** - Crée la table commandes avec toutes les colonnes
2. **20240824_fix_commandes_schema.sql** - Version corrigée avec structure complète
3. **20240824_update_missions_table.sql** - Met à jour la table missions
4. **20240824_mission_order_sync.sql** - Triggers de synchronisation

### 4. Structure de la table commandes
```sql
CREATE TABLE public.commandes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.profiles(id),
    titre TEXT NOT NULL,
    type_etude TEXT NOT NULL,  -- COLONNE MANQUANTE AJOUTÉE
    description TEXT,
    urgence TEXT DEFAULT 'normale',
    zone_geographique TEXT,
    parametres_analyses TEXT[],
    echantillons_requis INTEGER DEFAULT 1,
    rapport_langue TEXT DEFAULT 'fr',
    budget DECIMAL(10, 2),
    delai_souhaite INTEGER,
    lieu_intervention TEXT,
    statut TEXT DEFAULT 'en_attente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 5. Workflow automatique
Une fois les migrations appliquées :
- Quand un client crée une commande avec statut `confirme`
- Une mission est automatiquement créée et assignée à un intervenant
- Les statuts se synchronisent automatiquement

### 6. Test du système
```typescript
// Utiliser src/utils/testData.ts pour créer des données de test
import { createTestCommande, createTestProfile } from '@/utils/testData';
```

## Commandes utiles
```bash
# Voir les logs Supabase
supabase logs

# Voir l'état des migrations
supabase migration list

# Appliquer une migration spécifique
supabase db push --include-all
```
