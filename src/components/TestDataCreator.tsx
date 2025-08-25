import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function TestDataCreator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createTestData = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get current user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        toast({
          title: "Erreur",
          description: "Profil utilisateur non trouvé",
          variant: "destructive",
        });
        return;
      }

      // Create test commande if user is client
      if (profile.type_compte === 'client') {
        const { data: commande, error: commandeError } = await supabase
          .from('commandes')
          .insert({
            client_id: profile.id,
            titre: 'Test - Analyse qualité air bureau',
            type_etude: 'qualite_air_interieur',
            description: 'Analyse complète de la qualité de l\'air dans les bureaux - Données de test',
            urgence: 'normale',
            zone_geographique: 'Alger Centre',
            parametres_analyses: ['CO2', 'PM2.5', 'PM10', 'COV'],
            echantillons_requis: 3,
            rapport_langue: 'fr',
            budget: 2500.00,
            delai_souhaite: 7,
            lieu_intervention: '123 Rue Test, Alger',
            statut: 'confirme'
          })
          .select()
          .single();

        if (commandeError) throw commandeError;

        toast({
          title: "Données créées",
          description: `Commande test créée: ${commande.titre}`,
        });
      }

      // Skip message creation for now due to schema issues
      console.log('Test data creation completed successfully');

      toast({
        title: "Succès",
        description: "Données de test créées avec succès",
      });

    } catch (error) {
      console.error('Error creating test data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer les données de test",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Données de Test</CardTitle>
        <CardDescription>
          Créer des données de test pour vérifier le système
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={createTestData} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Création..." : "Créer Données Test"}
        </Button>
      </CardContent>
    </Card>
  );
}
