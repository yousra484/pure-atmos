import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Report {
  id: string;
  commande_id: string;
  langue: string;
  fichier_url: string;
  date_publication: string;
  commande?: {
    titre: string;
  };
}

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [languageFilter, setLanguageFilter] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  useEffect(() => {
    filterReports();
  }, [reports, languageFilter]);

  const fetchReports = async () => {
    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profile) return;

      // Fetch user's orders
      const { data: orders } = await supabase
        .from('commandes')
        .select('id, titre')
        .eq('client_id', profile.id);

      if (!orders || orders.length === 0) {
        setReports([]);
        return;
      }

      // Fetch reports for these orders
      const { data: reportsData } = await supabase
        .from('rapports')
        .select('*')
        .in('commande_id', orders.map(o => o.id))
        .order('date_publication', { ascending: false });

      // Combine reports with order titles
      const reportsWithOrders = reportsData?.map(report => ({
        ...report,
        commande: orders.find(o => o.id === report.commande_id)
      })) || [];

      setReports(reportsWithOrders);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    if (languageFilter === "all") {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter(report => report.langue === languageFilter));
    }
  };

  const getLanguageBadge = (language: string) => {
    const languageMap = {
      'fr': { label: 'Français', variant: 'default' as const },
      'en': { label: 'English', variant: 'secondary' as const },
      'ar': { label: 'العربية', variant: 'outline' as const },
      'es': { label: 'Español', variant: 'secondary' as const },
    };
    return languageMap[language as keyof typeof languageMap] || { 
      label: language, 
      variant: 'secondary' as const 
    };
  };

  const handleDownload = async (report: Report) => {
    if (report.fichier_url) {
      // In a real implementation, this would download from Supabase Storage
      // For now, we'll just show an alert
      alert(`Téléchargement du rapport: ${report.commande?.titre} (${report.langue})`);
    }
  };

  const getUniqueLanguages = () => {
    const languages = [...new Set(reports.map(r => r.langue))];
    return languages.filter(Boolean);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Mes Rapports</h1>
        <Card>
          <CardContent className="py-12">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-48" />
                    <div className="h-3 bg-muted rounded animate-pulse w-32" />
                  </div>
                  <div className="h-8 w-24 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mes Rapports</h1>
          <p className="text-muted-foreground">
            Téléchargez vos rapports en différentes langues
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={languageFilter} onValueChange={setLanguageFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrer par langue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes langues</SelectItem>
              {getUniqueLanguages().map((lang) => {
                const badge = getLanguageBadge(lang);
                return (
                  <SelectItem key={lang} value={lang}>
                    {badge.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rapports Disponibles
          </CardTitle>
          <CardDescription>
            {filteredReports.length} rapport(s) disponible(s) au téléchargement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {reports.length === 0 
                  ? "Aucun rapport disponible pour le moment"
                  : "Aucun rapport trouvé pour ce filtre"
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commande</TableHead>
                  <TableHead>Langue</TableHead>
                  <TableHead>Date de publication</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => {
                  const languageBadge = getLanguageBadge(report.langue);
                  
                  return (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.commande?.titre || 'Commande supprimée'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={languageBadge.variant}>
                          {languageBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(report.date_publication).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(report)}
                          disabled={!report.fichier_url}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Télécharger
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Languages Summary */}
      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Langues Disponibles</CardTitle>
            <CardDescription>
              Résumé des rapports par langue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {getUniqueLanguages().map((lang) => {
                const badge = getLanguageBadge(lang);
                const count = reports.filter(r => r.langue === lang).length;
                
                return (
                  <div key={lang} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                      <p className="text-sm text-muted-foreground">
                        {count} rapport(s)
                      </p>
                    </div>
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}