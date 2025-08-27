import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Eye, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface DemandeEtude {
  id: string;
  client_id: string;
  nom_entreprise: string;
  secteur_activite: string;
  type_etude: string;
  description_projet: string;
  zone_geographique: string;
  budget_estime: string | null;
  delai_souhaite: string | null;
  contact_nom: string;
  contact_email: string;
  contact_telephone: string | null;
  statut:
    | "en_attente"
    | "acceptée"
    | "en_cours"
    | "terminée"
    | "complete"
    | "annulée";
  created_at: string;
  updated_at: string;
  intervenant_id: string | null;
  date_acceptation: string | null;
  date_debut_mission: string | null;
  date_fin_mission: string | null;
  notes_terrain: string | null;
  latitude: number | null;
  longitude: number | null;
  rapport_url: string | null;
  rapport_uploaded_at: string | null;
  pays: string | null;
}


export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [completeStudies, setCompleteStudies] = useState<DemandeEtude[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<DemandeEtude | null>(null);
  const [loading, setLoading] = useState(true);

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
        .from("profiles")
        .select("id, type_compte")
        .eq("user_id", user.id)
        .single();

      if (!profile || profile.type_compte !== "intervention") return;

      // Fetch complete studies from demandes_etudes table
      const { data: completeStudiesData, error: completeStudiesError } =
        await supabase
          .from("demandes_etudes")
          .select("*")
          .eq("statut", "complete")
          .order("created_at", { ascending: false });

      console.log("Reports - Complete studies:", completeStudiesData);
      console.log("Reports - Error:", completeStudiesError);

      if (completeStudiesError) throw completeStudiesError;

      setCompleteStudies((completeStudiesData as DemandeEtude[]) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
          Consultez toutes les études complètes avec rapports PDF et soumettez
          vos rapports préliminaires
        </p>
      </div>

      {/* Complete Studies with PDF Reports */}
      {completeStudies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Toutes les Études Complètes ({completeStudies.length})
            </CardTitle>
            <CardDescription>
              Toutes les études terminées avec rapports PDF disponibles dans le
              système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completeStudies.map((study) => (
                <div
                  key={study.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-green-50"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{study.nom_entreprise}</h4>
                      {study.intervenant_id && (
                        <Badge variant="outline" className="text-xs">
                          Assignée à un intervenant
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Type: {study.type_etude}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Complétée le:{" "}
                      {new Date(study.created_at).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {study.description_projet}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Complète
                    </Badge>
                    {study.rapport_url ? (
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
                            <DialogTitle>
                              Rapport PDF - {study.nom_entreprise}
                            </DialogTitle>
                            <DialogDescription>
                              Étude: {study.type_etude} • Complétée le{" "}
                              {study.rapport_uploaded_at
                                ? new Date(
                                    study.rapport_uploaded_at
                                  ).toLocaleDateString("fr-FR")
                                : "Date inconnue"}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Entreprise
                                </label>
                                <p className="text-gray-900">
                                  {study.nom_entreprise}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-600">
                                  Type d'étude
                                </label>
                                <p className="text-gray-900">
                                  {study.type_etude}
                                </p>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Description
                              </label>
                              <p className="text-gray-900">
                                {study.description_projet}
                              </p>
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
                                      <span className="text-sm font-medium">
                                        Rapport_Final.pdf
                                      </span>
                                    </div>
                                    <Button
                                      onClick={() =>
                                        window.open(study.rapport_url, "_blank")
                                      }
                                      size="sm"
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      Ouvrir PDF
                                    </Button>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Uploadé le{" "}
                                    {study.rapport_uploaded_at
                                      ? new Date(
                                          study.rapport_uploaded_at
                                        ).toLocaleDateString("fr-FR")
                                      : "Date inconnue"}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Badge variant="secondary">Pas de rapport PDF</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state when no complete studies */}
      {completeStudies.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune étude complète</h3>
            <p className="text-muted-foreground">
              Il n'y a actuellement aucune étude avec le statut "complète" dans le système.
            </p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
