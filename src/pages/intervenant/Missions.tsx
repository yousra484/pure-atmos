import { useEffect, useState, useCallback } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Upload,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Eye,
  AlertTriangle,
  Filter,
  Navigation,
  CheckSquare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Mission {
  id: string;
  nom_entreprise: string;
  type_etude: string;
  description_projet: string;
  zone_geographique: string;
  statut: "en_attente" | "acceptée" | "en_cours" | "terminée" | "annulée";
  budget_estime: string;
  delai_souhaite: string;
  date_acceptation: string | null;
  date_debut_mission: string | null;
  date_fin_mission: string | null;
  intervenant_id: string | null;
  client_id: string;
  created_at: string;
  contact_nom: string;
  contact_email: string;
  contact_telephone: string;
  notes_terrain: string | null;
  latitude: number | null;
  longitude: number | null;
  // Legacy fields for compatibility
  demande_etude_id?: string;
  date_debut?: string;
  date_fin?: string;
}

interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

interface DemandeEtude {
  id: string;
  nom_entreprise: string;
  type_etude: string;
  description_projet: string;
  zone_geographique: string;
  statut:
    | "en_attente"
    | "acceptée"
    | "en_cours"
    | "terminée"
    | "complete"
    | "annulée";
  budget_estime: string;
  delai_souhaite: string;
  date_acceptation: string | null;
  date_debut_mission: string | null;
  date_fin_mission: string | null;
  intervenant_id: string | null;
  client_id: string;
  created_at: string;
  contact_nom: string;
  contact_email: string;
  contact_telephone: string;
  email_contact: string;
  telephone_contact: string;
  notes_terrain: string | null;
  latitude: number | null;
  longitude: number | null;
  rapport_url: string | null;
  rapport_uploaded_at: string | null;
  secteur_activite: string | null;
}

export default function Missions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [missions, setMissions] = useState<DemandeEtude[]>([]);
  const [availableDemandes, setAvailableDemandes] = useState<DemandeEtude[]>(
    []
  );
  const [allAssignedMissions, setAllAssignedMissions] = useState<
    DemandeEtude[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [selectedStudy, setSelectedStudy] = useState<DemandeEtude | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportMission, setSelectedReportMission] =
    useState<DemandeEtude | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [isUploadingReport, setIsUploadingReport] = useState(false);
  const [geoData, setGeoData] = useState<GeolocationData | null>(null);
  const [fieldNotes, setFieldNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to categorize studies by status
  const categorizeStudiesByStatus = (studies: DemandeEtude[]) => {
    const categories: { [key: string]: DemandeEtude[] } = {};

    studies.forEach((study) => {
      const status = study.statut || "en_attente";
      if (!categories[status]) {
        categories[status] = [];
      }
      categories[status].push(study);
    });

    return categories;
  };

  // Get unique statuses for tabs with proper labels
  const getStatusCategories = (studies: DemandeEtude[]) => {
    const statuses = [...new Set(studies.map((s) => s.statut))];
    const statusOrder: Array<
      | "acceptée"
      | "en_cours"
      | "terminée"
      | "complete"
      | "en_attente"
      | "annulée"
    > = [
      "acceptée",
      "en_cours",
      "terminée",
      "complete",
      "en_attente",
      "annulée",
    ];
    return statusOrder.filter((status) => statuses.includes(status));
  };

  // Get status label for display
  const getStatusLabel = (status: string): string => {
    const labels: { [key: string]: string } = {
      en_attente: "En attente",
      acceptée: "Acceptée",
      en_cours: "En cours",
      terminée: "Terminée",
      complete: "Complète",
      annulée: "Annulée",
    };
    return labels[status] || status;
  };

  const fetchMissions = useCallback(async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        console.error("Aucun utilisateur connecté");
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, type_compte")
        .eq("user_id", user.id)
        .single();

      if (!profile || profile.type_compte !== "intervention") {
        console.log("User is not an intervenant:", profile);
        return;
      }

      console.log(
        "Fetching all study submissions for intervenant:",
        profile.id
      );

      // Fetch ALL demandes_etudes for all intervenants to see
      const { data: toutesLesDemandesData, error: toutesDemandesError } =
        await supabase
          .from("demandes_etudes")
          .select('*')
          .order("created_at", { ascending: false });

      if (toutesDemandesError) {
        console.error("Erreur récupération demandes:", toutesDemandesError);
        return;
      }

      console.log("Missions - Toutes les demandes:", toutesLesDemandesData);
      console.log("Missions - Statuts trouvés:", [
        ...new Set(toutesLesDemandesData?.map((d) => d.statut) || []),
      ]);
      console.log(
        "Missions - Complete missions:",
        toutesLesDemandesData?.filter((d) => d.statut === "complete")
      );

      // Map data with proper types
      const demandesAvecColonnesManquantes: DemandeEtude[] = toutesLesDemandesData?.map(d => {
        const item = d as Record<string, unknown>; // Type assertion to access all database columns
        return {
          ...item,
          statut: item.statut as 'en_attente' | 'acceptée' | 'en_cours' | 'terminée' | 'complete' | 'annulée',
          email_contact: item.contact_email || '',
          telephone_contact: item.contact_telephone || '',
          date_acceptation: item.date_acceptation || null,
          date_debut_mission: item.date_debut_mission || null,
          date_fin_mission: item.date_fin_mission || null,
          intervenant_id: item.intervenant_id || null,
          notes_terrain: item.notes_terrain || null,
          latitude: item.latitude || null,
          longitude: item.longitude || null,
          rapport_url: item.rapport_url || null,
          rapport_uploaded_at: item.rapport_uploaded_at || null,
          secteur_activite: item.secteur_activite || null
        } as DemandeEtude;
      }) || [];

      // Séparer les demandes selon leur statut et assignation
      const demandesDisponibles = demandesAvecColonnesManquantes.filter(
        (d) => d.statut === "en_attente"
      );

      // Show accepted, in-progress, completed, and complete studies as missions
      const mesMissions = demandesAvecColonnesManquantes.filter(
        (d) =>
          d.statut === "acceptée" ||
          d.statut === "en_cours" ||
          d.statut === "terminée" ||
          d.statut === "complete"
      );

      const autresMissionsAssignees: DemandeEtude[] = [];

      setAvailableDemandes(demandesDisponibles);
      setMissions(mesMissions);

      // Store all assigned missions for display (read-only for other intervenants)
      setAllAssignedMissions(autresMissionsAssignees);
    } catch (error) {
      console.error("Erreur générale:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchMissions();
    }
  }, [user, fetchMissions]);

  // Fonction pour accepter une demande
  const accepterDemande = async (demandeId: string) => {
    try {
      if (!user?.id) return;

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return;

      // Accepter la demande
      const { error } = await supabase
        .from("demandes_etudes")
        .update({
          intervenant_id: profile.id,
          statut: "acceptée",
          date_acceptation: new Date().toISOString(),
        })
        .eq("id", demandeId)
        .eq("statut", "en_attente"); // Sécurité: seulement si encore en attente

      if (error) {
        console.error("Erreur acceptation demande:", error);
        return;
      }

      // Recharger les données
      fetchMissions();

      console.log("Demande acceptée avec succès");
    } catch (error) {
      console.error("Erreur lors de l'acceptation:", error);
    }
  };

  // Fonction pour accepter une étude disponible
  const handleAcceptStudy = async (studyId: string) => {
    try {
      if (!user?.id) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return;

      // Atomic update to prevent race conditions
      const { data: updatedStudy, error } = await supabase
        .from("demandes_etudes")
        .update({
          statut: "acceptée",
          // Note: These columns don't exist yet, will be added when migration is applied
          // intervenant_id: profile.id,
          // date_acceptation: new Date().toISOString()
        })
        .eq("id", studyId)
        .eq("statut", "en_attente")
        // .is('intervenant_id', null) // Will be enabled after migration
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de l'acceptation:", error);
        toast({
          title: "Erreur",
          description:
            "Cette étude a peut-être déjà été prise par un autre intervenant.",
          variant: "destructive",
        });
        return;
      }

      if (updatedStudy) {
        toast({
          title: "Étude acceptée !",
          description: `Vous avez accepté l'étude pour ${updatedStudy.nom_entreprise}`,
        });
        fetchMissions(); // Refresh data
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'acceptation.",
        variant: "destructive",
      });
    }
  };

  // Fonction pour démarrer une mission
  const handleStartMission = async (missionId: string) => {
    try {
      const { error } = await supabase
        .from("demandes_etudes")
        .update({
          statut: "en_cours",
          // date_debut_mission: new Date().toISOString() // Will be enabled after migration
        })
        .eq("id", missionId)
        .eq("statut", "acceptée");

      if (error) {
        console.error("Erreur démarrage mission:", error);
        toast({
          title: "Erreur",
          description: "Impossible de démarrer la mission.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Mission démarrée !",
        description: "La mission terrain a été démarrée avec succès.",
      });
      fetchMissions();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // Fonction pour terminer une mission
  const handleCompleteMission = async (missionId: string) => {
    try {
      const { error } = await supabase
        .from("demandes_etudes")
        .update({
          statut: "terminée",
          // date_fin_mission: new Date().toISOString() // Will be enabled after migration
        })
        .eq("id", missionId)
        .eq("statut", "en_cours");

      if (error) {
        console.error("Erreur fin mission:", error);
        toast({
          title: "Erreur",
          description: "Impossible de terminer la mission.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Mission terminée !",
        description:
          "La mission a été marquée comme terminée. Vous pouvez maintenant rédiger le rapport.",
      });
      fetchMissions();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleUploadReport = async () => {
    if (!reportFile || !selectedReportMission || !user) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier PDF.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (reportFile.type !== "application/pdf") {
      toast({
        title: "Format invalide",
        description: "Seuls les fichiers PDF sont acceptés.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (reportFile.size > 10 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille du fichier ne doit pas dépasser 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingReport(true);

    try {
      // Create unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `rapport_${selectedReportMission.id}_${timestamp}.pdf`;
      const filePath = `reports/${user.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("mission-reports")
        .upload(filePath, reportFile);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("mission-reports")
        .getPublicUrl(filePath);

      // Update the demande_etudes record with report URL and set status to complete
      const { error: updateError } = await supabase
        .from("demandes_etudes")
        .update({
          rapport_url: urlData.publicUrl,
          rapport_uploaded_at: new Date().toISOString(),
          statut: "complete",
        } as { rapport_url: string; rapport_uploaded_at: string; statut: string })
        .eq("id", selectedReportMission.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Rapport téléchargé !",
        description: "Le rapport PDF a été téléchargé avec succès.",
      });

      // Reset state and close dialog
      setReportFile(null);
      setSelectedReportMission(null);
      setIsReportDialogOpen(false);
      fetchMissions();
    } catch (error) {
      console.error("Erreur upload:", error);
      toast({
        title: "Erreur de téléchargement",
        description:
          "Impossible de télécharger le rapport. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingReport(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Géolocalisation non supportée",
        description: "Votre navigateur ne supporte pas la géolocalisation.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoData({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
        });
        toast({
          title: "Position obtenue",
          description: `Coordonnées: ${position.coords.latitude.toFixed(
            6
          )}, ${position.coords.longitude.toFixed(6)}`,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          title: "Erreur de géolocalisation",
          description: "Impossible d'obtenir votre position.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const startMission = async (missionId: string) => {
    try {
      const { error } = await supabase
        .from("demandes_etudes")
        .update({
          statut: "en_cours",
          date_debut_mission: new Date().toISOString(),
        })
        .eq("id", missionId);

      if (error) throw error;

      setMissions((prev) =>
        prev.map((m) =>
          m.id === missionId
            ? {
                ...m,
                statut: "en_cours",
                date_debut_mission: new Date().toISOString(),
              }
            : m
        )
      );

      toast({
        title: "Mission démarrée",
        description: "La mission a été marquée comme en cours.",
      });
    } catch (error) {
      console.error("Error starting mission:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la mission.",
        variant: "destructive",
      });
    }
  };

  const submitFieldData = async () => {
    if (!selectedMission || !geoData) return;

    setIsSubmitting(true);
    try {
      // Update mission with field data
      const { error } = await supabase
        .from("demandes_etudes")
        .update({
          statut: "terminée",
          date_fin_mission: new Date().toISOString(),
          description: fieldNotes,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
        })
        .eq("id", selectedMission.id);

      if (error) throw error;

      // Update local state
      setMissions((prev) =>
        prev.map((m) =>
          m.id === selectedMission.id
            ? {
                ...m,
                statut: "terminée",
                date_fin_mission: new Date().toISOString(),
                description: fieldNotes,
                latitude: geoData.latitude,
                longitude: geoData.longitude,
              }
            : m
        )
      );

      toast({
        title: "Données soumises",
        description: "Vos données terrain ont été enregistrées avec succès.",
      });

      // Reset form
      setSelectedMission(null);
      setFieldNotes("");
      setGeoData(null);
    } catch (error) {
      console.error("Error submitting field data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de soumettre les données.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      en_attente: {
        label: "En attente",
        variant: "secondary" as const,
        icon: Clock,
      },
      acceptée: {
        label: "Acceptée",
        variant: "default" as const,
        icon: CheckCircle,
      },
      en_cours: {
        label: "En cours",
        variant: "default" as const,
        icon: Clock,
      },
      terminée: {
        label: "Terminée",
        variant: "default" as const,
        icon: CheckCircle,
      },
      complete: {
        label: "Complète",
        variant: "default" as const,
        icon: FileText,
        className: "bg-green-100 text-green-800 border-green-200",
      },
      annulée: {
        label: "Annulée",
        variant: "destructive" as const,
        icon: AlertTriangle,
      },
    };
    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        variant: "secondary" as const,
        icon: Clock,
      }
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Missions Terrain</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/6" />
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
        <h1 className="text-3xl font-bold">Missions Terrain</h1>
        <p className="text-muted-foreground">
          Gérez vos missions et saisissez les données sur le terrain
        </p>
      </div>

      {/* Available Studies Section */}
      {availableDemandes.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Études Disponibles
                </CardTitle>
                <CardDescription>
                  Études non assignées organisées par type - Cliquez "Accepter"
                  pour les prendre en charge
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {availableDemandes.length} disponibles
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {availableDemandes.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune étude disponible
                </h3>
                <p className="text-gray-500">
                  Toutes les études ont été assignées ou sont en cours de
                  traitement
                </p>
              </div>
            ) : (
              <Tabs defaultValue="en_attente" className="w-full">
                <TabsList className="flex flex-wrap justify-start gap-1 h-auto p-1 mb-6 bg-muted">
                  {getStatusCategories(availableDemandes).map((status) => (
                    <TabsTrigger
                      key={status}
                      value={status}
                      className="flex items-center gap-2 px-3 py-2 text-sm whitespace-nowrap"
                    >
                      <span>{getStatusLabel(status)}</span>
                      <Badge
                        variant="secondary"
                        className="text-xs px-1.5 py-0.5"
                      >
                        {categorizeStudiesByStatus(availableDemandes)[status]
                          ?.length || 0}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {getStatusCategories(availableDemandes).map((status) => (
                  <TabsContent key={status} value={status}>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {categorizeStudiesByStatus(availableDemandes)[
                        status
                      ]?.map((demande) => (
                        <div
                          key={demande.id}
                          className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {demande.nom_entreprise}
                              </h3>
                              <p className="text-sm text-blue-600 font-medium">
                                {demande.type_etude}
                              </p>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                <span>{demande.zone_geographique}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                <span>
                                  Créé le{" "}
                                  {new Date(
                                    demande.created_at
                                  ).toLocaleDateString("fr-FR")}
                                </span>
                              </div>
                            </div>

                            {demande.description_projet && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {demande.description_projet}
                              </p>
                            )}

                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedStudy(demande);
                                  setIsDetailDialogOpen(true);
                                }}
                                className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Détails
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAcceptStudy(demande.id)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accepter
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}

      {/* My Missions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Mes Missions
              </CardTitle>
              <CardDescription>
                Missions assignées organisées par type et statut
              </CardDescription>
            </div>
            <Badge variant="default" className="text-lg px-3 py-1">
              {missions.length} missions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {missions.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune mission assignée
              </h3>
              <p className="text-gray-500 mb-4">
                Acceptez des études disponibles pour commencer vos missions
                terrain
              </p>
              {availableDemandes.length > 0 && (
                <Button
                  onClick={() => {
                    const availableStudiesSection = document.querySelector(
                      '[data-section="available-studies"]'
                    );
                    availableStudiesSection?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Voir les études disponibles
                </Button>
              )}
            </div>
          ) : (
            <Tabs
              defaultValue={getStatusCategories(missions)[0] || "acceptée"}
              className="w-full"
            >
              <TabsList className="flex flex-wrap justify-start gap-1 h-auto p-1 mb-6 bg-muted">
                {getStatusCategories(missions).map((status) => (
                  <TabsTrigger
                    key={status}
                    value={status}
                    className="flex items-center gap-2 px-3 py-2 text-sm whitespace-nowrap"
                  >
                    <span>{getStatusLabel(status)}</span>
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5"
                    >
                      {categorizeStudiesByStatus(missions)[status]?.length || 0}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              {getStatusCategories(missions).map((status) => (
                <TabsContent key={status} value={status}>
                  <div className="space-y-4">
                    {categorizeStudiesByStatus(missions)[status]?.map(
                      (mission) => {
                        const statusInfo = getStatusBadge(mission.statut);
                        const StatusIcon = statusInfo.icon;

                        return (
                          <div
                            key={mission.id}
                            className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                              mission.statut === "complete"
                                ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50"
                                : ""
                            }`}
                          >
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">
                                  {mission.type_etude || "Mission"} -{" "}
                                  {mission.nom_entreprise || "Sans nom"}
                                </h4>
                                <Badge
                                  variant={statusInfo.variant}
                                  className={`flex items-center ${
                                    mission.statut === "complete"
                                      ? "bg-green-100 text-green-800 border-green-200"
                                      : ""
                                  }`}
                                >
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusInfo.label}
                                </Badge>
                              </div>

                              <div className="flex items-center text-sm text-gray-600 space-x-4">
                                <span className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {mission.zone_geographique ||
                                    "Lieu non spécifié"}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  Créé le{" "}
                                  {new Date(
                                    mission.created_at || Date.now()
                                  ).toLocaleDateString("fr-FR")}
                                </span>
                              </div>

                              {mission.description_projet && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {mission.description_projet}
                                </p>
                              )}

                              {/* Enhanced info for complete missions */}
                              {mission.statut === "complete" &&
                                mission.rapport_url && (
                                  <div className="flex items-center space-x-4 text-sm">
                                    <div className="flex items-center text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                      <FileText className="w-3 h-3 mr-1" />
                                      <span className="font-medium">
                                        Rapport disponible
                                      </span>
                                    </div>
                                    {mission.rapport_uploaded_at && (
                                      <span className="text-gray-500 text-xs">
                                        Téléchargé le{" "}
                                        {new Date(
                                          mission.rapport_uploaded_at
                                        ).toLocaleDateString("fr-FR", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "numeric",
                                        })}
                                      </span>
                                    )}
                                  </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedStudy(mission);
                                  setIsDetailDialogOpen(true);
                                }}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Détails
                              </Button>

                              {mission.statut === "acceptée" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStartMission(mission.id)}
                                  className="bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                  <Navigation className="w-4 h-4 mr-1" />
                                  Commencer
                                </Button>
                              )}

                              {mission.statut === "en_cours" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleCompleteMission(mission.id)
                                  }
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Terminer
                                </Button>
                              )}

                              {mission.statut === "terminée" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (mission.rapport_url) {
                                      // If report exists, open it in new tab
                                      window.open(
                                        mission.rapport_url,
                                        "_blank"
                                      );
                                    } else {
                                      // If no report, open upload dialog
                                      setSelectedReportMission(mission);
                                      setIsReportDialogOpen(true);
                                    }
                                  }}
                                  className={
                                    mission.rapport_url
                                      ? "text-green-600 border-green-200 hover:bg-green-50"
                                      : "text-blue-600 border-blue-200 hover:bg-blue-50"
                                  }
                                >
                                  <FileText className="w-4 h-4 mr-1" />
                                  {mission.rapport_url
                                    ? "Voir rapport"
                                    : "Rapport"}
                                </Button>
                              )}

                              {mission.statut === "complete" && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedStudy(mission);
                                    setIsDetailDialogOpen(true);
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white shadow-md"
                                >
                                  <FileText className="w-4 h-4 mr-1" />
                                  Voir rapport
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Detailed Study Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Détails de l'étude
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur la demande d'étude
            </DialogDescription>
          </DialogHeader>

          {selectedStudy && (
            <div className="space-y-6">
              {/* Company Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-900">
                  Informations de l'entreprise
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Nom de l'entreprise
                    </label>
                    <p className="text-gray-900 font-medium">
                      {selectedStudy.nom_entreprise}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Secteur d'activité
                    </label>
                    <p className="text-gray-900">
                      {selectedStudy.secteur_activite || "Non spécifié"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Study Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-900">
                  Détails de l'étude
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Type d'étude
                    </label>
                    <p className="text-gray-900 font-medium">
                      {selectedStudy.type_etude}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Zone géographique
                    </label>
                    <p className="text-gray-900 flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                      {selectedStudy.zone_geographique}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Description du projet
                    </label>
                    <p className="text-gray-900 leading-relaxed">
                      {selectedStudy.description_projet}
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-900">
                  Détails du projet
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedStudy.budget_estime && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Budget estimé
                      </label>
                      <p className="text-gray-900">
                        {selectedStudy.budget_estime}
                      </p>
                    </div>
                  )}
                  {selectedStudy.delai_souhaite && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Délai souhaité
                      </label>
                      <p className="text-gray-900 flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-gray-500" />
                        {selectedStudy.delai_souhaite}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-900">
                  Informations de contact
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Nom du contact
                    </label>
                    <p className="text-gray-900 font-medium">
                      {selectedStudy.contact_nom}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <p className="text-gray-900">
                      {selectedStudy.contact_email}
                    </p>
                  </div>
                  {selectedStudy.contact_telephone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Téléphone
                      </label>
                      <p className="text-gray-900">
                        {selectedStudy.contact_telephone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Dates */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-900">
                  Statut et dates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Statut
                    </label>
                    <div className="flex items-center mt-1">
                      <Badge
                        variant={
                          selectedStudy.statut === "en_attente"
                            ? "secondary"
                            : "default"
                        }
                        className="capitalize"
                      >
                        {selectedStudy.statut.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Date de création
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedStudy.created_at).toLocaleDateString(
                        "fr-FR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Report Section - Show for complete missions */}
              {selectedStudy.statut === "complete" && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-lg mb-3 text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-600" />
                    Rapport PDF
                  </h3>
                  <div className="space-y-3">
                    {selectedStudy.rapport_url ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            Rapport téléchargé
                          </p>
                          {selectedStudy.rapport_uploaded_at && (
                            <p className="text-xs text-gray-500">
                              Le{" "}
                              {new Date(
                                selectedStudy.rapport_uploaded_at
                              ).toLocaleDateString("fr-FR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={() =>
                            window.open(selectedStudy.rapport_url!, "_blank")
                          }
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Ouvrir le rapport
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-600 mb-2">
                          Mission terminée - Rapport en cours de traitement
                        </p>
                        <p className="text-xs text-gray-500">
                          Le rapport PDF sera disponible prochainement
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  Fermer
                </Button>
                {selectedStudy.statut === "en_attente" && (
                  <Button
                    onClick={() => {
                      handleAcceptStudy(selectedStudy.id);
                      setIsDetailDialogOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Accepter cette étude
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Télécharger le rapport
            </DialogTitle>
            <DialogDescription>
              Sélectionnez le fichier PDF du rapport de mission
            </DialogDescription>
          </DialogHeader>

          {selectedReportMission && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900">
                  {selectedReportMission.nom_entreprise}
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedReportMission.type_etude}
                </p>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {selectedReportMission.zone_geographique}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Fichier PDF du rapport
                </label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setReportFile(file);
                    }
                  }}
                  className="cursor-pointer"
                />
                {reportFile && (
                  <div className="flex items-center text-sm text-green-600">
                    <FileText className="w-4 h-4 mr-1" />
                    {reportFile.name} (
                    {(reportFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500">
                • Format accepté: PDF uniquement
                <br />• Taille maximale: 10 MB
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsReportDialogOpen(false);
                setReportFile(null);
                setSelectedReportMission(null);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleUploadReport}
              disabled={!reportFile || isUploadingReport}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUploadingReport ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Téléchargement...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Télécharger
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
