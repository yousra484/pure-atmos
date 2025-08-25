import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function CreateTestOrder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState({
    titre: 'Test - Analyse qualité air bureau',
    type_etude: 'qualite_air_interieur',
    description: 'Analyse complète de la qualité de l\'air dans les bureaux - Test automatique',
    lieu_intervention: '123 Rue Test, Alger',
    budget: 2500,
    delai_souhaite: 7
  });

  const createTestOrder = async () => {
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

      // Create test commande
      const { data: commande, error: commandeError } = await supabase
        .from('commandes')
        .insert({
          client_id: profile.id,
          titre: orderData.titre,
          type_etude: orderData.type_etude,
          description: orderData.description,
          lieu_intervention: orderData.lieu_intervention,
          budget: orderData.budget,
          delai_souhaite: orderData.delai_souhaite,
          statut: 'confirme' // This should trigger mission creation
        })
        .select()
        .single();

      if (commandeError) throw commandeError;

      toast({
        title: "Commande créée",
        description: `Commande "${commande.titre}" créée avec succès. Une mission devrait être automatiquement assignée.`,
      });

      // Reset form
      setOrderData({
        titre: 'Test - Analyse qualité air bureau',
        type_etude: 'qualite_air_interieur',
        description: 'Analyse complète de la qualité de l\'air dans les bureaux - Test automatique',
        lieu_intervention: '123 Rue Test, Alger',
        budget: 2500,
        delai_souhaite: 7
      });

    } catch (error) {
      console.error('Error creating test order:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la commande de test",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Créer Commande Test</CardTitle>
        <CardDescription>
          Créer une commande test pour vérifier la création automatique de missions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Titre</label>
            <Input
              value={orderData.titre}
              onChange={(e) => setOrderData(prev => ({...prev, titre: e.target.value}))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type d'étude</label>
            <Select
              value={orderData.type_etude}
              onValueChange={(value) => setOrderData(prev => ({...prev, type_etude: value}))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qualite_air_interieur">Qualité air intérieur</SelectItem>
                <SelectItem value="qualite_air_exterieur">Qualité air extérieur</SelectItem>
                <SelectItem value="pollution_sonore">Pollution sonore</SelectItem>
                <SelectItem value="analyse_sol">Analyse sol</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={orderData.description}
            onChange={(e) => setOrderData(prev => ({...prev, description: e.target.value}))}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Lieu d'intervention</label>
          <Input
            value={orderData.lieu_intervention}
            onChange={(e) => setOrderData(prev => ({...prev, lieu_intervention: e.target.value}))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Budget (€)</label>
            <Input
              type="number"
              value={orderData.budget}
              onChange={(e) => setOrderData(prev => ({...prev, budget: Number(e.target.value)}))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Délai souhaité (jours)</label>
            <Input
              type="number"
              value={orderData.delai_souhaite}
              onChange={(e) => setOrderData(prev => ({...prev, delai_souhaite: Number(e.target.value)}))}
            />
          </div>
        </div>

        <Button 
          onClick={createTestOrder} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Création..." : "Créer Commande Test"}
        </Button>
      </CardContent>
    </Card>
  );
}
