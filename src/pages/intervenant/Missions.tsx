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
import {
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Camera,
  FileText,
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
  statut: 'en_attente' | 'acceptée' | 'en_cours' | 'terminée' | 'annulée';
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
  statut: 'en_attente' | 'acceptée' | 'en_cours' | 'terminée' | 'annulée';
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
  const [geoData, setGeoData] = useState<GeolocationData | null>(null);
  const [fieldNotes, setFieldNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          .select(
            `
          id,
          nom_entreprise,
          type_etude,
          description_projet,
          zone_geographique,
          statut,
          budget_estime,
          delai_souhaite,
          client_id,
          created_at,
          contact_nom,
          contact_email,
          contact_telephone
        `
          )
          .order("created_at", { ascending: false });

      if (toutesDemandesError) {
        console.error("Erreur récupération demandes:", toutesDemandesError);
        return;
      }

      console.log("Toutes les demandes trouvées:", toutesLesDemandesData);

      // Add missing columns with fallback values for current database
      const demandesAvecColonnesManquantes = toutesLesDemandesData?.map(d => ({
        ...d,
        statut: d.statut as 'en_attente' | 'acceptée' | 'en_cours' | 'terminée' | 'annulée',
        intervenant_id: null as string | null,
        date_acceptation: null as string | null,
        date_debut_mission: null as string | null,
        date_fin_mission: null as string | null,
        notes_terrain: null as string | null,
        latitude: null as number | null,
        longitude: null as number | null
      })) || [];

      // Séparer les demandes selon leur statut et assignation
      const demandesDisponibles = demandesAvecColonnesManquantes.filter(
        (d) => d.statut === "en_attente"
      );

      const mesMissions = demandesAvecColonnesManquantes.filter(
        (d) => d.statut === 'acceptée' || d.statut === 'en_cours' || d.statut === 'terminée'
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
        .from('demandes_etudes')
        .update({ 
          statut: 'acceptée', 
          // Note: These columns don't exist yet, will be added when migration is applied
          // intervenant_id: profile.id, 
          // date_acceptation: new Date().toISOString() 
        })
        .eq('id', studyId)
        .eq('statut', 'en_attente')
        // .is('intervenant_id', null) // Will be enabled after migration
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'acceptation:', error);
        toast({
          title: "Erreur",
          description: "Cette étude a peut-être déjà été prise par un autre intervenant.",
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
      console.error('Erreur:', error);
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
        .from('demandes_etudes')
        .update({ 
          statut: 'en_cours',
          // date_debut_mission: new Date().toISOString() // Will be enabled after migration
        })
        .eq('id', missionId)
        .eq('statut', 'acceptée');

      if (error) {
        console.error('Erreur démarrage mission:', error);
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
      console.error('Erreur:', error);
    }
  };

  // Fonction pour terminer une mission
  const handleCompleteMission = async (missionId: string) => {
    try {
      const { error } = await supabase
        .from('demandes_etudes')
        .update({ 
          statut: 'terminée',
          // date_fin_mission: new Date().toISOString() // Will be enabled after migration
        })
        .eq('id', missionId)
        .eq('statut', 'en_cours');

      if (error) {
        console.error('Erreur fin mission:', error);
        toast({
          title: "Erreur",
          description: "Impossible de terminer la mission.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Mission terminée !",
        description: "La mission a été marquée comme terminée. Vous pouvez maintenant rédiger le rapport.",
      });
      fetchMissions();
    } catch (error) {
      console.error('Erreur:', error);
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
        icon: Clock 
      },
      terminée: {
        label: "Terminée",
        variant: "default" as const,
        icon: CheckCircle,
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
                <CardTitle className="text-xl">Études Disponibles</CardTitle>
                <CardDescription>
                  Études non assignées - Cliquez "Accepter" pour les prendre en charge
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune étude disponible</h3>
                <p className="text-gray-500">
                  Toutes les études ont été assignées ou sont en cours de traitement
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableDemandes.map((demande) => (
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
                          <span>Créé le {new Date(demande.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>

                      {demande.description_projet && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {demande.description_projet}
                        </p>
                      )}

                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
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
            )}
          </CardContent>
        </Card>
      )}

      {/* My Missions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Mes Missions</CardTitle>
              <CardDescription>
                Missions assignées et en cours de traitement
              </CardDescription>
            </div>
            <Badge variant="default" className="text-lg px-3 py-1">
              {missions.length} missions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">

            {missions.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune mission assignée</h3>
                <p className="text-gray-500 mb-4">
                  Acceptez des études disponibles pour commencer vos missions terrain
                </p>
                {availableDemandes.length > 0 && (
                  <Button
                    onClick={() => {
                      const availableStudiesSection = document.querySelector('[data-section="available-studies"]');
                      availableStudiesSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Voir les études disponibles
                  </Button>
                )}
              </div>
            ) : (
              missions.map((mission) => {
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
                          {mission.type_etude || 'Mission'} - {mission.nom_entreprise || 'Sans nom'}
                        </h4>
                        <Badge variant={status.variant} className="flex items-center">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 space-x-4">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {mission.zone_geographique || 'Lieu non spécifié'}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Créé le {new Date(mission.created_at || Date.now()).toLocaleDateString('fr-FR')}
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
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Détails
                      </Button>
                      
                      {mission.statut === 'acceptée' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartMission(mission.id)}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <Navigation className="w-4 h-4 mr-1" />
                          Commencer
                        </Button>
                      )}
                      
                      {mission.statut === 'en_cours' && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteMission(mission.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Terminer
                        </Button>
                      )}
                      
                      {mission.statut === 'terminée' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Rapport
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
