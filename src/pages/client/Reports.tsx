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
  nom_entreprise: string;
  type_etude: string;
  zone_geographique: string;
  rapport_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profile) return;

      // Fetch user's completed studies with reports
      const { data: reportsData } = await supabase
        .from('demandes_etudes')
        .select('id, nom_entreprise, type_etude, zone_geographique, rapport_url, created_at, updated_at')
        .eq('client_id', profile.id)
        .eq('statut', 'complete')
        .not('rapport_url', 'is', null)
        .order('updated_at', { ascending: false });

      setReports(reportsData || []);
      setFilteredReports(reportsData || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleDownload = async (report: Report) => {
    if (report.rapport_url) {
      // Open the report URL in a new tab
      window.open(report.rapport_url, '_blank');
    }
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
            Téléchargez vos rapports d'analyses environnementales terminées
          </p>
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
                Aucun rapport disponible pour le moment
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entreprise</TableHead>
                  <TableHead>Type d'Étude</TableHead>
                  <TableHead>Zone Géographique</TableHead>
                  <TableHead>Date de Mise à Jour</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => {
                  return (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.nom_entreprise}
                      </TableCell>
                      <TableCell>
                        {report.type_etude}
                      </TableCell>
                      <TableCell>
                        {report.zone_geographique}
                      </TableCell>
                      <TableCell>
                        {new Date(report.updated_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(report)}
                          disabled={!report.rapport_url}
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

    </div>
  );
}