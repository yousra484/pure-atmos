import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  Globe,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalClients: number;
  totalIntervenants: number;
  totalDemandes: number;
  demandesEnAttente: number;
  demandesEnCours: number;
  demandesTerminees: number;
  demandesByCountry: { [key: string]: number };
}


const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalIntervenants: 0,
    totalDemandes: 0,
    demandesEnAttente: 0,
    demandesEnCours: 0,
    demandesTerminees: 0,
    demandesByCountry: {},
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch profiles stats
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("type_compte");
      
      if (profilesError) throw profilesError;

      // Fetch demandes stats
      const { data: demandes, error: demandesError } = await supabase
        .from("demandes_etudes")
        .select("statut");
      
      if (demandesError) throw demandesError;

      // Calculate stats
      const clients = profiles?.filter(p => p.type_compte === "client") || [];
      const intervenants = profiles?.filter(p => p.type_compte === "intervention") || [];
      
      const demandesEnAttente = demandes?.filter(d => d.statut === "en_attente") || [];
      const demandesAcceptees = demandes?.filter(d => d.statut === "acceptée") || [];
      const demandesEnCours = demandes?.filter(d => d.statut === "en_cours") || [];
      const demandesTerminees = demandes?.filter(d => d.statut === "terminée" || d.statut === "complete") || [];

      // Calculate counts
      const totalClients = clients.length;
      const totalIntervenants = intervenants.length;
      const nombreDemandesEnAttente = demandesEnAttente.length;
      const nombreDemandesAcceptees = demandesAcceptees.length;
      const nombreDemandesEnCours = demandesEnCours.length;
      const nombreDemandesTerminees = demandesTerminees.length;

      // Group by country (temporarily empty until pays column is added)
      const demandesByCountry: { [key: string]: number } = {};

      setStats({
        totalClients: totalClients,
        totalIntervenants: totalIntervenants,
        totalDemandes: demandes?.length || 0,
        demandesEnAttente: nombreDemandesEnAttente,
        demandesEnCours: nombreDemandesEnCours,
        demandesTerminees: nombreDemandesTerminees,
        demandesByCountry,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCountryName = (code: string) => {
    const countries: { [key: string]: string } = {
      algerie: "Algérie",
      kenya: "Kenya",
      tanzanie: "Tanzanie",
    };
    return countries[code] || code;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des statistiques...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord administrateur</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de l'activité sur la plateforme Atmos Africa Connect
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Comptes clients actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intervenants</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIntervenants}</div>
            <p className="text-xs text-muted-foreground">
              Spécialistes disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Demandes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDemandes}</div>
            <p className="text-xs text-muted-foreground">
              Demandes d'études totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.demandesTerminees}</div>
            <p className="text-xs text-muted-foreground">
              Demandes terminées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>État des demandes</CardTitle>
            <CardDescription>
              Répartition des demandes par statut
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">En attente</span>
              </div>
              <Badge variant="secondary">{stats.demandesEnAttente}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Acceptées</span>
              </div>
              <Badge variant="secondary">{stats.demandesEnCours}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Terminées</span>
              </div>
              <Badge variant="secondary">{stats.demandesTerminees}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par pays</CardTitle>
            <CardDescription>
              Demandes d'études par région
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(stats.demandesByCountry).map(([country, count]) => (
              <div key={country} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{getCountryName(country)}</span>
                </div>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
            {Object.keys(stats.demandesByCountry).length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>
            Accès direct aux fonctionnalités principales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            <Button variant="outline" className="justify-start" asChild>
              <a href="/admin/accounts">
                <Users className="mr-2 h-4 w-4" />
                Gérer les comptes
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/admin/projects">
                <Globe className="mr-2 h-4 w-4" />
                Voir les projets
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/admin/reports">
                <FileText className="mr-2 h-4 w-4" />
                Gérer les rapports
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default Dashboard ;
