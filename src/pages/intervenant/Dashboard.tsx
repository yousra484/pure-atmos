import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, CheckCircle, AlertTriangle, MessageSquare, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Mission {
  id: string;
  demande_etude_id: string;
  statut: string;
  date_debut: string;
  date_fin: string;
  demandes_etudes?: {
    type_etude: string;
    nom_entreprise: string;
    description_projet: string;
    zone_geographique: string;
    client_id: string;
  };
}

interface DashboardStats {
  totalMissions: number;
  activeMissions: number;
  completedMissions: number;
  pendingReports: number;
}

export default function IntervenantDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalMissions: 0,
    activeMissions: 0,
    completedMissions: 0,
    pendingReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntervenantData();
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchIntervenantData();
    }
  }, [user, authLoading]);

  // Fonction pour créer les missions manquantes directement
  const createMissingMissions = async () => {
    try {
      console.log('Création des missions pour les demandes existantes...');

      // 1. Vérifier s'il y a un intervenant
      const { data: intervenants } = await supabase
        .from('profiles')
        .select('id')
        .eq('type_compte', 'intervention')
        .limit(1);

      let intervenantId = intervenants?.[0]?.id;

      // 2. Si pas d'intervenant, en créer un
      if (!intervenantId) {
        const { data: newIntervenant } = await supabase
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

        intervenantId = newIntervenant?.id;
      }

      // 3. Trouver toutes les demandes sans mission
      const { data: demandesSansMission } = await supabase
        .from('demandes_etudes')
        .select('id, statut, created_at');

      if (demandesSansMission && demandesSansMission.length > 0) {
        const missionsToCreate = demandesSansMission.map(demande => ({
          demande_etude_id: demande.id,
          intervenant_id: intervenantId,
          statut: 'assignée',
          date_debut: new Date().toISOString(),
          date_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }));

        await supabase.from('missions').insert(missionsToCreate);
        fetchIntervenantData(); // Recharger les données
      }
    } catch (error) {
      console.error('Erreur lors de la création des missions:', error);
    }
  };

  const fetchIntervenantData = async () => {
    try {
      if (authLoading) {
        console.log('Authentification en cours...');
        return;
      }

      if (!user?.id) {
        console.log('Aucun utilisateur connecté - redirection nécessaire');
        setLoading(false);
        return;
      }

      console.log('Utilisateur connecté:', user.id);

      // Get the intervenant profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, type_compte')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        console.error('Profil intervenant non trouvé');
        return;
      }

      // Fetch MES demandes acceptées/en cours/terminées
      const { data: mesDemandesData, error: mesDemandesError } = await supabase
        .from('demandes_etudes')
        .select(`
          id,
          nom_entreprise,
          type_etude,
          description_projet,
          zone_geographique,
          statut,
          date_acceptation,
          date_debut_mission,
          date_fin_mission,
          notes_terrain,
          client_id,
          created_at
        `)
        .eq('intervenant_id', profile.id)
        .in('statut', ['acceptée', 'en_cours', 'terminée'])
        .order('created_at', { ascending: false });

      if (mesDemandesError) {
        console.error('Erreur lors de la récupération de mes demandes:', mesDemandesError);
        return;
      }

      // Transform data to match Mission interface
      const typedMissions = (mesDemandesData || []).map(demande => ({
        id: demande.id,
        demande_etude_id: demande.id,
        statut: demande.statut,
        date_debut: demande.date_debut_mission,
        date_fin: demande.date_fin_mission,
        demandes_etudes: {
          nom_entreprise: demande.nom_entreprise,
          type_etude: demande.type_etude,
          description_projet: demande.description_projet,
          zone_geographique: demande.zone_geographique,
          client_id: demande.client_id
        }
      })) as Mission[];
      setMissions(typedMissions);

      // Calculate statistics
      const totalMissions = typedMissions.length;
      const activeMissions = typedMissions.filter(m => 
        m.statut === 'en_cours' || m.statut === 'acceptée'
      ).length;
      const completedMissions = typedMissions.filter(m => 
        m.statut === 'terminée'
      ).length;
      const pendingReports = typedMissions.filter(m => 
        m.statut === 'terminée'
      ).length;

      setStats({
        totalMissions,
        activeMissions,
        completedMissions,
        pendingReports,
      });

    } catch (error) {
      console.error('Erreur générale:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'assignée': { label: 'Assignée', variant: 'secondary' as const, icon: Clock },
      'en_cours': { label: 'En cours', variant: 'default' as const, icon: Clock },
      'terminée': { label: 'Terminée', variant: 'default' as const, icon: CheckCircle },
      'annulée': { label: 'Annulée', variant: 'destructive' as const, icon: AlertTriangle },
      'acceptée': { label: 'Acceptée', variant: 'secondary' as const, icon: CheckCircle },
    };
    return statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const, 
      icon: Clock 
    };
  };

  if (loading || authLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Tableau de bord Intervenant</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-8 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord Intervenant</h1>
        <p className="text-muted-foreground">
          Gérez vos missions terrain et soumettez vos rapports
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Missions
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMissions}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Missions Actives</CardTitle>
              <Clock className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeMissions}</div>
              <p className="text-sm text-muted-foreground mt-1">
                En cours d'exécution
              </p>
            </CardContent>
          </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missions Terminées</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completedMissions}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Complétées avec succès
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rapports en Attente</CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingReports}</div>
            <p className="text-sm text-muted-foreground mt-1">
              À rédiger
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bouton pour créer les missions manquantes */}
      {stats.totalMissions === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-yellow-800">Aucune mission trouvée</h3>
              <p className="text-yellow-700">Il semble qu'il n'y ait pas de missions assignées. Voulez-vous créer des missions pour les demandes d'études existantes ?</p>
            </div>
            <button
              onClick={createMissingMissions}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Créer les missions
            </button>
          </div>
        </div>
      )}

      {/* Recent Missions */}
      <Card>
        <CardHeader>
          <CardTitle>Missions Récentes</CardTitle>
          <CardDescription>
            Vos dernières missions assignées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {missions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucune mission assignée
            </p>
          ) : (
            <div className="space-y-4">
              {missions.slice(0, 5).map((mission) => {
                const status = getStatusBadge(mission.statut);
                const StatusIcon = status.icon;
                
                return (
                  <div key={mission.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">
                        {mission.demandes_etudes?.type_etude || 'Mission'} - {mission.demandes_etudes?.nom_entreprise || 'Sans nom'}
                      </h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-1" />
                        {mission.demandes_etudes?.zone_geographique || 'Lieu non spécifié'}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Début: {new Date(mission.date_debut).toLocaleDateString('fr-FR')}
                        {mission.date_fin && ` - Fin: ${new Date(mission.date_fin).toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={status.variant}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Voir détails
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-500" />
              Missions Terrain
            </CardTitle>
            <CardDescription>
              Gérer vos missions sur le terrain
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-500" />
              Soumettre Rapport
            </CardTitle>
            <CardDescription>
              Envoyer vos résultats préliminaires
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-purple-500" />
              Messagerie Équipe
            </CardTitle>
            <CardDescription>
              Communiquer avec l'équipe
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
