import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Globe,
  Search,
  Filter,
  Eye,
  Calendar,
  MapPin,
  User,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DemandeEtude {
  id: string;
  titre: string;
  description: string;
  statut: string;
  pays: string;
  budget_estime: number;
  delai_souhaite: string;
  created_at: string;
  client_id: string;
  intervenant_id: string | null;
  profiles: {
    nom_complet: string;
    email: string;
  };
}

const Projects = () => {
  const [demandes, setDemandes] = useState<DemandeEtude[]>([]);
  const [filteredDemandes, setFilteredDemandes] = useState<DemandeEtude[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchDemandes();
  }, []);

  useEffect(() => {
    filterDemandes();
  }, [demandes, searchTerm, selectedCountry, selectedStatus]);

  const fetchDemandes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("demandes_etudes")
        .select(`
          *,
          profiles!demandes_etudes_client_id_fkey (
            nom_complet,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDemandes(data || []);
      setFilteredDemandes(data || []);
    } catch (error) {
      console.error("Error fetching demandes:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les projets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDemandes = () => {
    let filtered = [...demandes];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.profiles?.nom_complet.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by country
    if (selectedCountry !== "all") {
      filtered = filtered.filter((d) => d.pays === selectedCountry);
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((d) => d.statut === selectedStatus);
    }

    setFilteredDemandes(filtered);
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig: { [key: string]: { variant: any; label: string } } = {
      en_attente: { variant: "secondary", label: "En attente" },
      acceptée: { variant: "default", label: "Acceptée" },
      en_cours: { variant: "default", label: "En cours" },
      terminée: { variant: "success", label: "Terminée" },
      complete: { variant: "success", label: "Complète" },
      annulée: { variant: "destructive", label: "Annulée" },
    };

    const config = statusConfig[statut] || { variant: "outline", label: statut };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCountryName = (code: string) => {
    const countries: { [key: string]: string } = {
      algerie: "Algérie",
      kenya: "Kenya",
      tanzanie: "Tanzanie",
    };
    return countries[code] || code;
  };

  const getCountryFlag = (code: string) => {
    const flags: { [key: string]: string } = {
      algerie: "🇩🇿",
      kenya: "🇰🇪",
      tanzanie: "🇹🇿",
    };
    return flags[code] || "🌍";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des projets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Supervision des projets</h1>
        <p className="text-muted-foreground">
          Gérez et suivez toutes les demandes d'études par pays
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <Globe className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tous les pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pays</SelectItem>
                <SelectItem value="algerie">🇩🇿 Algérie</SelectItem>
                <SelectItem value="kenya">🇰🇪 Kenya</SelectItem>
                <SelectItem value="tanzanie">🇹🇿 Tanzanie</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="acceptée">Acceptée</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="terminée">Terminée</SelectItem>
                <SelectItem value="annulée">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics by Country */}
      <div className="grid gap-4 md:grid-cols-3">
        {["algerie", "kenya", "tanzanie"].map((country) => {
          const countryDemandes = demandes.filter((d) => d.pays === country);
          const enAttente = countryDemandes.filter((d) => d.statut === "en_attente").length;
          const enCours = countryDemandes.filter((d) => d.statut === "en_cours" || d.statut === "acceptée").length;
          const terminees = countryDemandes.filter((d) => d.statut === "terminée" || d.statut === "complete").length;

          return (
            <Card key={country}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {getCountryFlag(country)} {getCountryName(country)}
                  </CardTitle>
                  <Badge variant="outline">{countryDemandes.length} projets</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">En attente:</span>
                    <span className="font-medium">{enAttente}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">En cours:</span>
                    <span className="font-medium">{enCours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Terminées:</span>
                    <span className="font-medium">{terminees}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des projets ({filteredDemandes.length})</CardTitle>
          <CardDescription>
            Cliquez sur un projet pour voir les détails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projet</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Pays</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDemandes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Aucun projet trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDemandes.map((demande) => (
                    <TableRow key={demande.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{demande.titre}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {demande.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm">{demande.profiles?.nom_complet}</div>
                            <div className="text-xs text-muted-foreground">
                              {demande.profiles?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{getCountryFlag(demande.pays)}</span>
                          <span className="text-sm">{getCountryName(demande.pays)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(demande.statut)}</TableCell>
                      <TableCell>
                        {demande.budget_estime ? (
                          <span className="font-medium">
                            {demande.budget_estime.toLocaleString()} €
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(demande.created_at), "dd MMM yyyy", { locale: fr })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // TODO: Navigate to project details
                            toast({
                              title: "Fonctionnalité en développement",
                              description: "La vue détaillée sera bientôt disponible.",
                            });
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Projects;
