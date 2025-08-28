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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  Globe,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Report {
  id: string;
  titre: string;
  description: string;
  statut: string;
  type_rapport: string;
  demande_id: string;
  client_id: string;
  intervenant_id: string;
  date_creation: string;
  date_validation: string | null;
  url_document: string | null;
  commentaires: string | null;
  demande: {
    titre: string;
    pays: string;
  };
  client: {
    nom_complet: string;
    email: string;
  };
  intervenant: {
    nom_complet: string;
  };
}

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, selectedCountry, selectedType]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from demandes_etudes table
      const { data: demandesData } = await supabase
        .from('demandes_etudes')
        .select(`
          id,
          nom_entreprise,
          type_etude,
          statut,
          created_at,
          updated_at,
          pays,
          client_id,
          intervenant_id,
          rapport_url,
          contact_nom,
          contact_email
        `)
        .eq('statut', 'complete')
        .order('updated_at', { ascending: false });

      // Transform data to match Report interface
      const transformedReports: Report[] = (demandesData || []).map(demande => ({
        id: demande.id,
        titre: `Rapport - ${demande.nom_entreprise}`,
        description: `Étude ${demande.type_etude} - ${demande.nom_entreprise}`,
        statut: "complete",
        type_rapport: "analyse",
        demande_id: demande.id,
        client_id: demande.client_id,
        intervenant_id: demande.intervenant_id || "",
        date_creation: demande.created_at,
        date_validation: demande.rapport_url ? demande.updated_at : null,
        url_document: demande.rapport_url,
        commentaires: null,
        demande: {
          titre: `Étude ${demande.type_etude}`,
          pays: demande.pays || "non_specifie",
        },
        client: {
          nom_complet: demande.contact_nom || "Client non spécifié",
          email: demande.contact_email || "email@non-specifie.com",
        },
        intervenant: {
          nom_complet: "Intervenant",
        },
      }));

      setReports(transformedReports);
      setFilteredReports(transformedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les rapports.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.client.nom_complet.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCountry !== "all") {
      filtered = filtered.filter((r) => r.demande.pays === selectedCountry);
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((r) => r.type_rapport === selectedType);
    }

    setFilteredReports(filtered);
  };


  const getStatusBadge = (statut: string) => {
    return (
      <Badge variant="default" className="gap-1 bg-green-100 text-green-800 border-green-200">
        <FileText className="h-3 w-3" />
        Terminé
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig: { [key: string]: string } = {
      analyse: "Analyse",
      echantillonnage: "Échantillonnage",
      consultation: "Consultation",
      terrain: "Terrain",
      laboratoire: "Laboratoire",
    };
    return <Badge variant="outline">{typeConfig[type] || type}</Badge>;
  };

  const getCountryFlag = (code: string) => {
    const flags: { [key: string]: string } = {
      algerie: "🇩🇿",
      kenya: "🇰🇪",
      tanzanie: "🇹🇿",
    };
    return flags[code] || "🌍";
  };

  const handleDownloadReport = (report: Report) => {
    if (report.url_document) {
      window.open(report.url_document, '_blank');
    } else {
      toast({
        title: "Rapport non disponible",
        description: "Le fichier du rapport n'est pas encore disponible.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setIsDetailsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des rapports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des rapports</h1>
        <p className="text-muted-foreground">
          Consultez les rapports d'études environnementales terminées
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total rapports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
        

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter((r) => {
                const date = new Date(r.date_creation);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return date > weekAgo;
              }).length}
            </div>
          </CardContent>
        </Card>
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
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tous les pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pays</SelectItem>
                <SelectItem value="algerie">Algérie</SelectItem>
                <SelectItem value="kenya">Kenya</SelectItem>
                <SelectItem value="tanzanie">Tanzanie</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <FileText className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="analyse">Analyse</SelectItem>
                <SelectItem value="echantillonnage">Échantillonnage</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="terrain">Terrain</SelectItem>
                <SelectItem value="laboratoire">Laboratoire</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des rapports ({filteredReports.length})</CardTitle>
          <CardDescription>
            Cliquez sur un rapport pour le consulter ou le télécharger
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rapport</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Intervenant</TableHead>
                  <TableHead>Pays</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Aucun rapport trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.titre}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {report.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(report.type_rapport)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{report.client.nom_complet}</div>
                          <div className="text-xs text-muted-foreground">
                            {report.client.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{report.intervenant.nom_complet}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{getCountryFlag(report.demande.pays)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(report.statut)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(report.date_creation), "dd MMM", { locale: fr })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {report.url_document && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDownloadReport(report)}
                              title="Télécharger le rapport"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetails(report)}
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails du rapport</DialogTitle>
            <DialogDescription>
              Informations complètes sur le rapport d'étude
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Titre</label>
                  <p className="text-sm font-medium">{selectedReport.titre}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="text-sm">{getTypeBadge(selectedReport.type_rapport)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Statut</label>
                  <p className="text-sm">{getStatusBadge(selectedReport.statut)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pays</label>
                  <div className="flex items-center gap-1">
                    <span>{getCountryFlag(selectedReport.demande.pays)}</span>
                    <span className="text-sm">{selectedReport.demande.pays}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm">{selectedReport.description}</p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Client</label>
                  <p className="text-sm">{selectedReport.client.nom_complet}</p>
                  <p className="text-xs text-muted-foreground">{selectedReport.client.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Intervenant</label>
                  <p className="text-sm">{selectedReport.intervenant.nom_complet}</p>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date de création</label>
                  <p className="text-sm">
                    {format(new Date(selectedReport.date_creation), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </p>
                </div>
                {selectedReport.date_validation && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date de validation</label>
                    <p className="text-sm">
                      {format(new Date(selectedReport.date_validation), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedReport.commentaires && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Commentaires</label>
                  <p className="text-sm">{selectedReport.commentaires}</p>
                </div>
              )}
              
              {selectedReport.url_document && (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Document disponible</p>
                    <p className="text-xs text-muted-foreground">Cliquez pour télécharger le rapport</p>
                  </div>
                  <Button onClick={() => handleDownloadReport(selectedReport)}>
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Fermer
            </Button>
            {selectedReport?.url_document && (
              <Button onClick={() => handleDownloadReport(selectedReport)}>
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Reports;
