import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Send,
  Calendar,
  User,
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
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isValidationDialogOpen, setIsValidationDialogOpen] = useState(false);
  const [validationComment, setValidationComment] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, selectedStatus, selectedType]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Simulate fetching reports data
      // In production, this would fetch from the rapports table
      const mockReports: Report[] = [
        {
          id: "1",
          titre: "Analyse qualité air - Usine Alger Nord",
          description: "Rapport complet d'analyse de la qualité de l'air",
          statut: "en_attente",
          type_rapport: "analyse",
          demande_id: "d1",
          client_id: "c1",
          intervenant_id: "i1",
          date_creation: new Date().toISOString(),
          date_validation: null,
          url_document: null,
          commentaires: null,
          demande: {
            titre: "Étude pollution atmosphérique",
            pays: "algerie",
          },
          client: {
            nom_complet: "Ahmed Benali",
            email: "ahmed.benali@example.com",
          },
          intervenant: {
            nom_complet: "Dr. Sarah Mansouri",
          },
        },
        {
          id: "2",
          titre: "Rapport échantillonnage - Nairobi Industrial",
          description: "Résultats d'échantillonnage et analyses laboratoire",
          statut: "valide",
          type_rapport: "echantillonnage",
          demande_id: "d2",
          client_id: "c2",
          intervenant_id: "i2",
          date_creation: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          date_validation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          url_document: "/reports/sample.pdf",
          commentaires: "Rapport validé et approuvé",
          demande: {
            titre: "Analyse émissions industrielles",
            pays: "kenya",
          },
          client: {
            nom_complet: "John Kamau",
            email: "john.kamau@example.com",
          },
          intervenant: {
            nom_complet: "Prof. James Ochieng",
          },
        },
      ];

      setReports(mockReports);
      setFilteredReports(mockReports);
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

    if (selectedStatus !== "all") {
      filtered = filtered.filter((r) => r.statut === selectedStatus);
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((r) => r.type_rapport === selectedType);
    }

    setFilteredReports(filtered);
  };

  const handleValidateReport = async () => {
    if (!selectedReport) return;

    try {
      // Simulate report validation
      const updatedReports = reports.map((r) =>
        r.id === selectedReport.id
          ? {
              ...r,
              statut: "valide",
              date_validation: new Date().toISOString(),
              commentaires: validationComment,
            }
          : r
      );
      setReports(updatedReports);

      toast({
        title: "Rapport validé",
        description: "Le rapport a été validé et publié avec succès.",
      });

      setIsValidationDialogOpen(false);
      setValidationComment("");
      setSelectedReport(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de valider le rapport.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig: { [key: string]: { variant: any; label: string; icon: any } } = {
      en_attente: { variant: "secondary", label: "En attente", icon: Clock },
      en_revision: { variant: "default", label: "En révision", icon: Eye },
      valide: { variant: "success", label: "Validé", icon: CheckCircle },
      rejete: { variant: "destructive", label: "Rejeté", icon: XCircle },
    };

    const config = statusConfig[statut] || { variant: "outline", label: statut, icon: FileText };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
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
          Validez et publiez les rapports d'études environnementales
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
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter((r) => r.statut === "en_attente").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Validés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter((r) => r.statut === "valide").length}
            </div>
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
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="en_revision">En révision</SelectItem>
                <SelectItem value="valide">Validé</SelectItem>
                <SelectItem value="rejete">Rejeté</SelectItem>
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
            Cliquez sur un rapport pour le valider ou le télécharger
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
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {report.statut === "en_attente" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedReport(report);
                                setIsValidationDialogOpen(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
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

      {/* Validation Dialog */}
      <Dialog open={isValidationDialogOpen} onOpenChange={setIsValidationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider le rapport</DialogTitle>
            <DialogDescription>
              Validez et publiez ce rapport pour le client
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Titre du rapport</label>
                <p className="text-sm text-muted-foreground">{selectedReport.titre}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Client</label>
                <p className="text-sm text-muted-foreground">
                  {selectedReport.client.nom_complet}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Commentaires de validation</label>
                <Textarea
                  placeholder="Ajoutez vos commentaires..."
                  value={validationComment}
                  onChange={(e) => setValidationComment(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsValidationDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleValidateReport}>
              <Send className="mr-2 h-4 w-4" />
              Valider et publier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
