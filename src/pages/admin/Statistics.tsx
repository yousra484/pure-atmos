import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Globe,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Download,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface StatData {
  totalClients: number;
  totalIntervenants: number;
  totalDemandes: number;
  demandesTerminees: number;
  revenueTotal: number;
  tauxCompletion: number;
  croissanceClients: number;
  croissanceDemandes: number;
  demandesByMonth: { month: string; count: number }[];
  demandesByCountry: { country: string; count: number; percentage: number }[];
  demandesByStatus: { status: string; count: number; color: string }[];
  topIntervenants: { name: string; missions: number; revenue: number }[];
}

const Statistics = () => {
  const [stats, setStats] = useState<StatData>({
    totalClients: 0,
    totalIntervenants: 0,
    totalDemandes: 0,
    demandesTerminees: 0,
    revenueTotal: 0,
    tauxCompletion: 0,
    croissanceClients: 0,
    croissanceDemandes: 0,
    demandesByMonth: [],
    demandesByCountry: [],
    demandesByStatus: [],
    topIntervenants: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const { toast } = useToast();

  useEffect(() => {
    fetchStatistics();
  }, [selectedPeriod]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Fetch real data from Supabase
      const { data: profiles } = await supabase
        .from("profiles")
        .select("type_compte, created_at, pays");

      const { data: demandes } = await supabase
        .from("demandes_etudes")
        .select("statut, pays, created_at, budget_estime");

      // Calculate statistics
      const clients = profiles?.filter(p => p.type_compte === "client") || [];
      const intervenants = profiles?.filter(p => p.type_compte === "intervention") || [];
      const totalDemandes = demandes?.length || 0;
      const demandesTerminees = demandes?.filter(d => d.statut === "terminée").length || 0;
      const tauxCompletion = totalDemandes > 0 ? (demandesTerminees / totalDemandes) * 100 : 0;

      // Calculate revenue (sum of budgets)
      const revenueTotal = demandes?.reduce((sum, d) => sum + (d.budget_estime || 0), 0) || 0;

      // Calculate growth (mock data for demonstration)
      const croissanceClients = 15.2; // In production, calculate from historical data
      const croissanceDemandes = 23.5;

      // Group demandes by month (last 6 months)
      const monthlyData = generateMonthlyData(demandes || []);

      // Group by country
      const countryData = generateCountryData(demandes || []);

      // Group by status
      const statusData = generateStatusData(demandes || []);

      // Top intervenants (mock data)
      const topIntervenants = [
        { name: "Dr. Sarah Mansouri", missions: 12, revenue: 45000 },
        { name: "Prof. James Ochieng", missions: 10, revenue: 38000 },
        { name: "Dr. Ahmed Khalil", missions: 8, revenue: 32000 },
        { name: "Ing. Maria Santos", missions: 7, revenue: 28000 },
      ];

      setStats({
        totalClients: clients.length,
        totalIntervenants: intervenants.length,
        totalDemandes,
        demandesTerminees,
        revenueTotal,
        tauxCompletion,
        croissanceClients,
        croissanceDemandes,
        demandesByMonth: monthlyData,
        demandesByCountry: countryData,
        demandesByStatus: statusData,
        topIntervenants,
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (demandes: any[]) => {
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
    return months.map((month, index) => ({
      month,
      count: Math.floor(Math.random() * 20) + 5, // Mock data
    }));
  };

  const generateCountryData = (demandes: any[]) => {
    const countries = ["algerie", "kenya", "tanzanie"];
    const total = demandes.length || 1;
    
    return countries.map(country => {
      const count = demandes.filter(d => d.pays === country).length;
      return {
        country: getCountryName(country),
        count,
        percentage: (count / total) * 100,
      };
    });
  };

  const generateStatusData = (demandes: any[]) => {
    const statusConfig = [
      { status: "en_attente", label: "En attente", color: "#fbbf24" },
      { status: "acceptée", label: "Acceptée", color: "#3b82f6" },
      { status: "en_cours", label: "En cours", color: "#8b5cf6" },
      { status: "terminée", label: "Terminée", color: "#10b981" },
      { status: "annulée", label: "Annulée", color: "#ef4444" },
    ];

    return statusConfig.map(config => ({
      status: config.label,
      count: demandes.filter(d => d.statut === config.status).length,
      color: config.color,
    }));
  };

  const getCountryName = (code: string) => {
    const countries: { [key: string]: string } = {
      algerie: "Algérie",
      kenya: "Kenya",
      tanzanie: "Tanzanie",
    };
    return countries[code] || code;
  };

  const exportStatistics = () => {
    toast({
      title: "Export en cours",
      description: "Les statistiques sont en cours d'export...",
    });
    // In production, implement actual CSV/PDF export
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistiques d'activité</h1>
          <p className="text-muted-foreground">
            Analysez les performances et tendances de la plateforme
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchStatistics}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
          <Button onClick={exportStatistics}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clients totaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +{stats.croissanceClients}% ce mois
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Demandes totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDemandes}</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +{stats.croissanceDemandes}% ce mois
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taux de complétion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tauxCompletion.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">
              {stats.demandesTerminees} terminées
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.revenueTotal.toLocaleString()} €
            </div>
            <div className="text-sm text-muted-foreground">
              Budget estimé total
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Évolution mensuelle
            </CardTitle>
            <CardDescription>
              Nombre de demandes par mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.demandesByMonth.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.month}</span>
                  <div className="flex items-center gap-2 flex-1 ml-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(item.count / 30) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Country Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Répartition par pays
            </CardTitle>
            <CardDescription>
              Distribution des demandes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.demandesByCountry.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.country}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.count} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Distribution des statuts
            </CardTitle>
            <CardDescription>
              Répartition des demandes par statut
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.demandesByStatus.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.status}</span>
                  </div>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top intervenants
            </CardTitle>
            <CardDescription>
              Les intervenants les plus actifs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topIntervenants.map((intervenant, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{intervenant.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {intervenant.missions} missions
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {intervenant.revenue.toLocaleString()} €
                    </div>
                    <div className="text-xs text-muted-foreground">Revenus</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
