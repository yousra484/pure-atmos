// Test data creation utility for development
import { supabase } from "@/integrations/supabase/client";

export const createTestCommande = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from('commandes')
      .insert({
        client_id: clientId,
        titre: 'Analyse qualité air - Bureau Alger',
        type_etude: 'qualite_air_interieur',
        description: 'Analyse complète de la qualité de l\'air dans nos bureaux',
        urgence: 'normale',
        zone_geographique: 'Alger Centre',
        parametres_analyses: ['CO2', 'PM2.5', 'PM10', 'COV', 'Formaldéhyde'],
        echantillons_requis: 3,
        rapport_langue: 'fr',
        budget: 2500.00,
        delai_souhaite: 7,
        lieu_intervention: '123 Rue Didouche Mourad, Alger',
        statut: 'confirme'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating test commande:', error);
    throw error;
  }
};

export const createTestProfile = async (userId: string, type: 'client' | 'intervention') => {
  try {
    const profileData = type === 'client' 
      ? {
          user_id: userId,
          nom: 'Benali',
          prenom: 'Ahmed',
          email: 'ahmed.benali@entreprise.dz',
          type_compte: 'client',
          telephone: '+213 555 123 456',
          entreprise: 'Entreprise Test Alger',
          pays: 'Algérie'
        }
      : {
          user_id: userId,
          nom: 'Kaddour',
          prenom: 'Fatima',
          email: 'fatima.kaddour@atmos.dz',
          type_compte: 'intervention',
          telephone: '+213 555 789 012',
          specialisation: 'Analyse environnementale',
          experience: 5,
          pays: 'Algérie'
        };

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating test profile:', error);
    throw error;
  }
};
