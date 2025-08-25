// Utilitaire pour créer des missions pour les demandes_etudes existantes
import { supabase } from '../integrations/supabase/client';

export async function createMissionsForExistingDemandes() {
  try {
    console.log('Création des missions pour les demandes existantes...');

    // 1. Vérifier s'il y a un intervenant
    const { data: intervenants, error: intervenantError } = await supabase
      .from('profiles')
      .select('id')
      .eq('type_compte', 'intervention')
      .limit(1);

    let intervenantId = intervenants?.[0]?.id;

    // 2. Si pas d'intervenant, en créer un
    if (!intervenantId) {
      console.log('Aucun intervenant trouvé, création d\'un profil par défaut...');
      
      const { data: newIntervenant, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: crypto.randomUUID(),
          nom: 'Intervenant',
          prenom: 'Par Défaut',
          email: 'intervenant@atmos.com',
          type_compte: 'intervention'
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Erreur création intervenant:', createError);
        return false;
      }

      intervenantId = newIntervenant.id;
      console.log('Intervenant créé avec ID:', intervenantId);
    }

    // 3. Trouver toutes les demandes sans mission
    const { data: demandesSansMission, error: demandesError } = await supabase
      .from('demandes_etudes')
      .select(`
        id,
        statut,
        created_at
      `)
      .not('id', 'in', `(
        SELECT demande_etude_id 
        FROM missions 
        WHERE demande_etude_id IS NOT NULL
      )`);

    if (demandesError) {
      console.error('Erreur récupération demandes:', demandesError);
      return false;
    }

    console.log(`${demandesSansMission?.length || 0} demandes sans mission trouvées`);

    // 4. Créer les missions manquantes
    if (demandesSansMission && demandesSansMission.length > 0) {
      const missionsToCreate = demandesSansMission.map(demande => ({
        demande_etude_id: demande.id,
        intervenant_id: intervenantId,
        statut: demande.statut === 'en_attente' ? 'assignée' : 
               demande.statut === 'active' ? 'en_cours' :
               demande.statut === 'termine' ? 'terminée' :
               demande.statut === 'annule' ? 'annulée' : 'assignée',
        date_debut: new Date().toISOString(),
        date_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      const { data: newMissions, error: missionError } = await supabase
        .from('missions')
        .insert(missionsToCreate)
        .select();

      if (missionError) {
        console.error('Erreur création missions:', missionError);
        return false;
      }

      console.log(`${newMissions?.length || 0} missions créées avec succès`);
    }

    return true;
  } catch (error) {
    console.error('Erreur générale:', error);
    return false;
  }
}
