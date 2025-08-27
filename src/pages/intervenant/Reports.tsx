import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Upload, Send, Eye, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Mission {
  id: string;
  demande_etude_id: string;
  statut: string;
  date_fin: string;
  description: string;
  rapport_url?: string;
  rapport_uploaded_at?: string;
  commande?: {
    titre: string;
    type_etude: string;
    client_id: string;
  };
}

interface DemandeEtude {
  id: string;
  nom_entreprise: string;
  type_etude: string;
  description_projet: string;
  statut: 'en_attente' | 'acceptée' | 'en_cours' | 'terminée' | 'complete' | 'annulée';
  rapport_url: string | null;
  rapport_uploaded_at: string | null;
  created_at: string;
}

interface Report {
  id: string;
  mission_id: string;
  titre: string;
  contenu: string;
  statut: string;
  type_rapport: string;
  created_at: string;
  fichier_url?: string;
}

export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [completeStudies, setCompleteStudies] = useState<DemandeEtude[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<DemandeEtude | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [reportData, setReportData] = useState({
    titre: '',
    contenu: '',
    type_rapport: 'preliminaire',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      if (!user?.id) return;

      // Fetch profile to get intervenant ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, type_compte')
        .eq('user_id', user.id)
        .single();

      if (!profile || profile.type_compte !== 'intervention') return;

      // Fetch completed missions
      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select(`
          *,
          commandes!inner(titre, type_etude, client_id)
        `)
        .eq('intervenant_id', profile.id)
        .eq('statut', 'termine')
        .order('date_fin', { ascending: false });

      // Fetch complete studies from demandes_etudes (all complete studies that this intervenant can see)
      const { data: allCompleteStudiesData, error: completeStudiesError } = await supabase
        .from('demandes_etudes')
        .select('*')
        .eq('statut', 'complete')
        .order('created_at', { ascending: false });

      // Filter complete studies that this intervenant has worked on
      const completeStudiesData = allCompleteStudiesData?.filter(study => 
        study.intervenant_id === profile.id
      ) || [];

      console.log('Reports - Profile ID:', profile.id);
      console.log('Reports - All complete studies:', allCompleteStudiesData);
      console.log('Reports - Filtered complete studies:', completeStudiesData);
      console.log('Reports - Complete studies error:', completeStudiesError);

      if (missionsError) throw missionsError;
      if (completeStudiesError) throw completeStudiesError;

      // Fetch existing reports
      const missionIds = missionsData?.map(m => m.id) || [];
      const { data: reportsData, error: reportsError } = await supabase
        .from('rapports')
        .select('*')
        .in('mission_id', missionIds)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      setMissions(missionsData || []);
      setCompleteStudies(completeStudiesData || []);
      setReports(reportsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async () => {
    if (!selectedMission || !reportData.titre.trim() || !reportData.contenu.trim()) {
      toast({
        title: "Données manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert report into database
      const { data: newReport, error } = await supabase
        .from('rapports')
        .insert({
          mission_id: selectedMission.id,
          demande_etude_id: selectedMission.demande_etude_id,
          titre: reportData.titre,
          contenu: reportData.contenu,
          type_rapport: reportData.type_rapport,
          statut: 'soumis',
          langue: 'fr', // Default to French
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setReports(prev => [newReport, ...prev]);

      toast({
        title: "Rapport soumis",
        description: "Votre rapport a été envoyé avec succès au client.",
      });

      // Reset form
      setSelectedMission(null);
      setReportData({
        titre: '',
        contenu: '',
        type_rapport: 'preliminaire',
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre le rapport.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReportStatusBadge = (status: string) => {
    const statusMap = {
      'brouillon': { label: 'Brouillon', variant: 'secondary' as const, icon: FileText },
      'soumis': { label: 'Soumis', variant: 'default' as const, icon: Send },
      'valide': { label: 'Validé', variant: 'default' as const, icon: CheckCircle },
      'rejete': { label: 'Rejeté', variant: 'destructive' as const, icon: Clock },
    };
    return statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const, 
      icon: FileText 
    };
  };

  const getMissionReport = (missionId: string) => {
    return reports.find(r => r.mission_id === missionId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Rapports</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/4" />
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
        <h1 className="text-3xl font-bold">Rapports</h1>
        <p className="text-muted-foreground">
          Soumettez vos rapports préliminaires aux clients
        </p>
      </div>

      {/* Complete Studies with PDF Reports */}
      {completeStudies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Études Complètes</CardTitle>
            <CardDescription>
              Études terminées avec rapports PDF disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completeStudies.map((study) => (
                <div key={study.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div className="space-y-1">
                    <h4 className="font-medium">{study.nom_entreprise}</h4>
                    <p className="text-sm text-muted-foreground">
                      Type: {study.type_etude}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Complétée le: {new Date(study.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Complète
                    </Badge>
                    {study.rapport_url && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedStudy(study)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Voir rapport
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Rapport PDF - {study.nom_entreprise}</DialogTitle>
                            <DialogDescription>
                              Étude: {study.type_etude} • Complétée le {study.rapport_uploaded_at ? new Date(study.rapport_uploaded_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Entreprise
                                </label>
                                <p className="text-gray-900">{study.nom_entreprise}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Type d'étude
                                </label>
                                <p className="text-gray-900">{study.type_etude}</p>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Description
                              </label>
                              <p className="text-gray-900">{study.description_projet}</p>
                            </div>
                            {study.rapport_url && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">
                                  Rapport PDF
                                </label>
                                <div className="border rounded-lg p-4 bg-gray-50">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <FileText className="w-5 h-5 text-blue-600" />
                                      <span className="text-sm font-medium">Rapport_Final.pdf</span>
                                    </div>
                                    <Button 
                                      onClick={() => window.open(study.rapport_url, '_blank')}
                                      size="sm"
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      Ouvrir PDF
                                    </Button>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Uploadé le {study.rapport_uploaded_at ? new Date(study.rapport_uploaded_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missions Ready for Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Missions Terminées</CardTitle>
          <CardDescription>
            Missions prêtes pour la soumission de rapports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {missions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucune mission terminée
            </p>
          ) : (
            <div className="space-y-4">
              {missions.map((mission) => {
                const existingReport = getMissionReport(mission.id);
                
                return (
                  <div key={mission.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">
                        {mission.commande?.titre || 'Mission sans titre'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Type: {mission.commande?.type_etude || 'Non spécifié'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Terminée le: {new Date(mission.date_fin).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {existingReport ? (
                        <Badge variant={getReportStatusBadge(existingReport.statut).variant}>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Rapport soumis
                        </Badge>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              onClick={() => {
                                setSelectedMission(mission);
                                setReportData({
                                  titre: `Rapport ${mission.commande?.type_etude} - ${mission.commande?.titre}`,
                                  contenu: '',
                                  type_rapport: 'preliminaire',
                                });
                              }}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Créer Rapport
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Nouveau Rapport</DialogTitle>
                              <DialogDescription>
                                Mission: {mission.commande?.titre}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="titre">Titre du rapport</Label>
                                  <Input
                                    id="titre"
                                    value={reportData.titre}
                                    onChange={(e) => setReportData(prev => ({
                                      ...prev,
                                      titre: e.target.value
                                    }))}
                                    placeholder="Titre du rapport..."
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="type">Type de rapport</Label>
                                  <Select
                                    value={reportData.type_rapport}
                                    onValueChange={(value) => setReportData(prev => ({
                                      ...prev,
                                      type_rapport: value
                                    }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="preliminaire">Préliminaire</SelectItem>
                                      <SelectItem value="final">Final</SelectItem>
                                      <SelectItem value="technique">Technique</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="contenu">Contenu du rapport</Label>
                                <Textarea
                                  id="contenu"
                                  value={reportData.contenu}
                                  onChange={(e) => setReportData(prev => ({
                                    ...prev,
                                    contenu: e.target.value
                                  }))}
                                  placeholder="Rédigez votre rapport détaillé ici..."
                                  rows={12}
                                  className="min-h-[300px]"
                                />
                              </div>

                              <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-medium mb-2">Informations de la mission</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Type d'étude:</span>
                                    <p>{mission.commande?.type_etude}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Date de fin:</span>
                                    <p>{new Date(mission.date_fin).toLocaleDateString('fr-FR')}</p>
                                  </div>
                                </div>
                                {mission.description && (
                                  <div className="mt-2">
                                    <span className="font-medium">Notes terrain:</span>
                                    <p className="text-sm mt-1">{mission.description}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            <DialogFooter>
                              <DialogTrigger asChild>
                                <Button variant="outline">Annuler</Button>
                              </DialogTrigger>
                              <Button 
                                onClick={submitReport}
                                disabled={isSubmitting || !reportData.titre.trim() || !reportData.contenu.trim()}
                              >
                                {isSubmitting ? "Envoi..." : "Soumettre Rapport"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submitted Reports */}
      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rapports Soumis</CardTitle>
            <CardDescription>
              Historique de vos rapports envoyés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => {
                const status = getReportStatusBadge(report.statut);
                const StatusIcon = status.icon;
                
                return (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{report.titre}</h4>
                      <p className="text-sm text-muted-foreground">
                        Type: {report.type_rapport} • Soumis le: {new Date(report.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={status.variant}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                    </div>
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
