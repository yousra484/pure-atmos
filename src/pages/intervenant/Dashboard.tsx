import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  FileText,
  Eye,
  Play,
  CheckSquare,
  Users,
  Calendar,
  Briefcase,
} from "lucide-react";
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
  statut: "en_attente" | "acceptée" | "en_cours" | "terminée" | "complete" | "annulée";
  created_at: string;
  updated_at: string;
  intervenant_id: string | null;
  date_acceptation: string | null;
  date_debut_mission: string | null;
  date_fin_mission: string | null;
  notes_terrain: string | null;
  latitude: number | null;
  longitude: number | null;
  rapport_url?: string | null;
  rapport_uploaded_at?: string | null;
}

interface Mission extends DemandeEtude {
  demande_etude_id: string;
  date_debut: string;
  date_fin: string;
}

interface DashboardStats {
  totalMissions: number;
  activeMissions: number;
  completedMissions: number;
  pendingReports: number;
  availableStudies: number;
}

export default function IntervenantDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalMissions: 0,
    activeMissions: 0,
    completedMissions: 0,
    pendingReports: 0,
    availableStudies: 0,
  });
  const [availableDemandes, setAvailableDemandes] = useState<DemandeEtude[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedStudy, setSelectedStudy] = useState<DemandeEtude | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [profile, setProfile] = useState<{
    id: string;
    nom: string;
    prenom: string;
    type_compte: string;
    specialite?: string;
    zone_intervention?: string;
  } | null>(null);

  const fetchIntervenantData = useCallback(async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        console.error("Aucun utilisateur connecté");
        return;
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profileData) {
        console.error("Erreur récupération profil:", profileError);
        return;
      }

      if (profileData.type_compte !== "intervention") {
        console.log("User is not an intervenant");
        return;
      }

      setProfile(profileData);

      console.log("Fetching all study submissions for dashboard");

      // Fetch ALL demandes_etudes for dashboard overview (using current schema)
      const { data: toutesLesDemandesData, error: toutesDemandesError } =
        await supabase
          .from("demandes_etudes")
          .select(
            `
          id,
          nom_entreprise,
          secteur_activite,
          type_etude,
          description_projet,
          zone_geographique,
          budget_estime,
          delai_souhaite,
          contact_nom,
          contact_email,
          contact_telephone,
          statut,
          client_id,
          created_at,
          updated_at,
          rapport_url,
          rapport_uploaded_at
        `
          )
          .order("created_at", { ascending: false });

      if (toutesDemandesError) {
        console.error("Erreur récupération demandes:", toutesDemandesError);
        return;
      }

     

      // Add missing columns with fallback values for current database
      const demandesAvecColonnesManquantes =
        toutesLesDemandesData?.map((d) => ({
          ...d,
          statut: d.statut as
            | "en_attente"
            | "acceptée"
            | "en_cours"
            | "terminée"
            | "complete"
            | "annulée",
          intervenant_id: null as string | null,
          date_acceptation: null as string | null,
          date_debut_mission: null as string | null,
          date_fin_mission: null as string | null,
          notes_terrain: null as string | null,
          latitude: null as number | null,
          longitude: null as number | null,
        })) || [];

      // Separate studies by status
      // Only show studies that are truly available (en_attente status only)
      const demandesDisponibles = demandesAvecColonnesManquantes.filter(
        (d) => d.statut === "en_attente"
      );

      // Show accepted, in-progress, completed, and complete studies as missions
      const mesMissions = demandesAvecColonnesManquantes.filter(
        (d) => d.statut === "acceptée" || d.statut === "en_cours" || d.statut === "terminée" || d.statut === "complete"
      );
      const autresMissions: DemandeEtude[] = [];

      // Set available studies (only en_attente) and missions separately
      setAvailableDemandes([...demandesDisponibles, ...mesMissions]);

      // Transform mesMissions to match Mission interface
      const transformedMissions: Mission[] = mesMissions.map((mission) => ({
        ...mission,
        demande_etude_id: mission.id,
        date_debut: mission.date_debut_mission || "",
        date_fin: mission.date_fin_mission || "",
        intervenant_id: null,
        date_acceptation: null,
        date_debut_mission: null,
        date_fin_mission: null,
        notes_terrain: null,
        latitude: null,
        longitude: null,
      }));
      setMissions(transformedMissions);

      // Calculate statistics based on available data
      // Since intervenant_id doesn't exist yet, we'll show general statistics
      const totalStudies = toutesLesDemandesData?.length || 0;
      const availableStudiesCount = demandesDisponibles.length;
      const acceptedStudies =
        toutesLesDemandesData?.filter((d) => d.statut === "acceptée").length ||
        0;
      const activeStudies =
        toutesLesDemandesData?.filter((d) => d.statut === "en_cours").length ||
        0;
      const completedStudies =
        toutesLesDemandesData?.filter((d) => d.statut === "terminée").length ||
        0;
      const completeStudies =
        toutesLesDemandesData?.filter((d) => d.statut === "complete").length ||
        0;

      setStats({
        totalMissions: acceptedStudies + activeStudies + completedStudies + completeStudies,
        activeMissions: activeStudies,
        completedMissions: completedStudies + completeStudies,
        pendingReports: completedStudies, // Only terminée studies need reports, complete ones already have them
        availableStudies: availableStudiesCount,
      });
    } catch (error) {
      console.error("Erreur générale:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchIntervenantData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user, fetchIntervenantData]);

  // Study detail functions
  const handleViewDetails = (study: DemandeEtude) => {
    setSelectedStudy(study);
    setIsDetailDialogOpen(true);
  };

  // Mission management functions
  const handleStartMission = async (missionId: string) => {
    try {
      const { error } = await supabase
        .from("demandes_etudes")
        .update({
          statut: "en_cours",
          date_debut_mission: new Date().toISOString(),
        })
        .eq("id", missionId);

      if (error) throw error;

      toast({
        title: "Mission démarrée",
        description: "La mission a été démarrée avec succès.",
      });

      fetchIntervenantData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la mission.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteMission = async (missionId: string) => {
    try {
      const { error } = await supabase
        .from("demandes_etudes")
        .update({
          statut: "terminée",
          date_fin_mission: new Date().toISOString(),
        })
        .eq("id", missionId);

      if (error) throw error;

      toast({
        title: "Mission terminée",
        description: "La mission a été marquée comme terminée.",
      });

      fetchIntervenantData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de terminer la mission.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptStudy = async (studyId: string) => {
    try {
      // Get current user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (!profile) throw new Error("Profile not found");

      // Use atomic update with conditions to prevent race conditions
      const { data: updatedStudy, error } = await supabase
        .from("demandes_etudes")
        .update({
          statut: "acceptée",
          intervenant_id: profile.id,
          date_acceptation: new Date().toISOString(),
        })
        .eq("id", studyId)
        .eq("statut", "en_attente") // Only update if still available
        .is("intervenant_id", null) // Only update if not already assigned
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows updated - study was already taken
          toast({
            title: "Étude déjà prise",
            description:
              "Cette étude a déjà été acceptée par un autre intervenant.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      if (!updatedStudy) {
        toast({
          title: "Étude déjà prise",
          description:
            "Cette étude a déjà été acceptée par un autre intervenant.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Étude acceptée",
        description: "L'étude a été assignée à votre compte avec succès.",
      });

      // Refresh data to remove the accepted study from available list
      fetchIntervenantData();
    } catch (error) {
      console.error("Error accepting study:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'accepter l'étude. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      assignée: {
        label: "Assignée",
        variant: "secondary" as const,
        icon: Clock,
      },
      en_cours: { label: "En cours", variant: "default" as const, icon: Clock },
      terminée: {
        label: "Terminée",
        variant: "default" as const,
        icon: CheckCircle,
      },
      complete: {
        label: "Complète",
        variant: "default" as const,
        icon: FileText,
      },
      annulée: {
        label: "Annulée",
        variant: "destructive" as const,
        icon: AlertTriangle,
      },
      acceptée: {
        label: "Acceptée",
        variant: "secondary" as const,
        icon: CheckCircle,
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

  if (loading || authLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Tableau de bord Intervenant</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-8 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
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
        <h1 className="text-3xl font-bold">
          Tableau de bord Intervenant
          {profile && (
            <span className="text-lg font-normal text-muted-foreground ml-2">
              - {profile.prenom} {profile.nom}
            </span>
          )}
        </h1>
        <div className="space-y-1">
          <p className="text-muted-foreground">
            Gérez vos missions terrain et soumettez vos rapports
          </p>
          {profile && (
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {profile.specialite && (
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  Spécialité: {profile.specialite}
                </span>
              )}
              {profile.zone_intervention && (
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Zone: {profile.zone_intervention}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Études</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMissions}</div>
            <p className="text-xs text-muted-foreground">
              Études en cours/terminées
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Études Actives
            </CardTitle>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMissions}</div>
            <p className="text-xs text-muted-foreground">
              En cours d'exécution
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Études Terminées
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedMissions}</div>
            <p className="text-xs text-muted-foreground">
              Complétées avec succès
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rapports en Attente
            </CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
            <p className="text-xs text-muted-foreground">À rédiger</p>
          </CardContent>
        </Card>
      </div>

      {/* All Missions Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestion des Missions</CardTitle>
            <CardDescription>
              Vos dernières missions - triées par date
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/intervenant/missions")}
            className="flex items-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            Voir les études disponibles
          </Button>
        </CardHeader>
        <CardContent>
          {/* Show accepted, active, and completed studies as missions */}
          {(() => {
            // Show latest missions sorted by date (most recent first)
            const allMissions = availableDemandes
              .filter(
                (d) =>
                  d.statut === "acceptée" ||
                  d.statut === "en_cours" ||
                  d.statut === "terminée" ||
                  d.statut === "complete"
              )
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )
              .slice(0, 5); // Show only the 5 most recent missions

            return allMissions.length === 0 ? (
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
                <Button
                  onClick={() => navigate("/intervenant/missions")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Voir les études disponibles
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {allMissions.map((mission) => {
                  const status = getStatusBadge(mission.statut);
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={mission.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            {mission.type_etude} - {mission.nom_entreprise}
                          </h4>
                          <Badge
                            variant={status.variant}
                            className="flex items-center"
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>

                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {mission.zone_geographique}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Créé le{" "}
                            {new Date(mission.created_at).toLocaleDateString(
                              "fr-FR"
                            )}
                          </span>
                        </div>

                        {mission.description_projet && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {mission.description_projet}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(mission)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Détails
                        </Button>

                        {mission.statut === "acceptée" && (
                          <Button
                            size="sm"
                            onClick={() => handleStartMission(mission.id)}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Commencer
                          </Button>
                        )}

                        {mission.statut === "en_cours" && (
                          <Button
                            size="sm"
                            onClick={() => handleCompleteMission(mission.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckSquare className="w-4 h-4 mr-1" />
                            Terminer
                          </Button>
                        )}

                        {mission.statut === "terminée" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigate(`/intervenant/reports/${mission.id}`)
                            }
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Rapport
                          </Button>
                        )}

                        {mission.statut === "complete" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(mission)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Voir rapport
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {availableDemandes.filter(
                  (d) =>
                    d.statut === "acceptée" ||
                    d.statut === "en_cours" ||
                    d.statut === "terminée" ||
                    d.statut === "complete"
                ).length > 5 && (
                  <div className="text-center pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/intervenant/missions")}
                      className="flex items-center"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Voir toutes les missions (
                      {
                        availableDemandes.filter(
                          (d) =>
                            d.statut === "acceptée" ||
                            d.statut === "en_cours" ||
                            d.statut === "terminée" ||
                            d.statut === "complete"
                        ).length
                      }
                      )
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Available Studies */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Études Disponibles</CardTitle>
              <CardDescription>
                Toutes les études non assignées - Cliquez "Accepter" pour les
                prendre
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {availableDemandes.filter((d) => d.statut === "en_attente").length} disponibles
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {availableDemandes.filter((d) => d.statut === "en_attente").length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Aucune étude disponible
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Toutes les études ont été assignées
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableDemandes
                .filter((d) => d.statut === "en_attente")
                .map((demande) => (
                <div
                  key={demande.id}
                  className="flex items-center justify-between p-6 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-green-50"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-lg">
                        {demande.type_etude || "Étude"} -{" "}
                        {demande.nom_entreprise || "Sans nom"}
                      </h4>
                      <Badge variant="outline" className="bg-white">
                        {demande.statut}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {demande.zone_geographique || "Lieu non spécifié"}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Créée le{" "}
                        {new Date(demande.created_at).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                    </div>

                    {demande.description_projet && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {demande.description_projet}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 ml-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(demande)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Détails
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAcceptStudy(demande.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckSquare className="w-4 h-4 mr-1" />
                      Accepter
                    </Button>
                  </div>
                </div>
              ))}

              {availableDemandes.filter((d) => d.statut === "en_attente").length > 5 && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/intervenant/available-studies")}
                  >
                    Voir toutes les études ({availableDemandes.filter((d) => d.statut === "en_attente").length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/intervenant/missions")}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-blue-500" />
              Mes Missions
            </CardTitle>
            <CardDescription>Gérer vos missions assignées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalMissions}
              </div>
              <div className="text-sm text-muted-foreground">
                {stats.activeMissions} actives
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/intervenant/reports")}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-500" />
              Rapports
            </CardTitle>
            <CardDescription>Soumettre et gérer vos rapports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">
                {stats.completedMissions}
              </div>
              <div className="text-sm text-muted-foreground">
                {stats.pendingReports} en attente
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/intervenant/messages")}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-purple-500" />
              Messages
            </CardTitle>
            <CardDescription>Communiquer avec l'équipe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-muted-foreground">nouveaux</div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/intervenant/calendar")}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-orange-500" />
              Planning
            </CardTitle>
            <CardDescription>Voir votre calendrier de missions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Prochaine mission
              </div>
              <div className="text-sm font-medium">
                {missions.length > 0 ? "Aujourd'hui" : "Aucune"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/intervenant/profile")}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-500" />
              Profil
            </CardTitle>
            <CardDescription>Gérer votre profil intervenant</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Mettre à jour vos informations
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => window.open("/help", "_blank")}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
              Aide & Support
            </CardTitle>
            <CardDescription>Documentation et assistance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Guides et FAQ</div>
          </CardContent>
        </Card>
      </div>

      {/* Study Details Dialog */}
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
                      {selectedStudy.secteur_activite}
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

              {/* Report Section - Only show for complete missions */}
              {selectedStudy.statut === "complete" && selectedStudy.rapport_url && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-lg mb-3 text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-600" />
                    Rapport PDF
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Rapport téléchargé</p>
                        {selectedStudy.rapport_uploaded_at && (
                          <p className="text-xs text-gray-500">
                            Le {new Date(selectedStudy.rapport_uploaded_at).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long", 
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => window.open(selectedStudy.rapport_url!, '_blank')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Ouvrir le rapport
                      </Button>
                    </div>
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
    </div>
  );
}
