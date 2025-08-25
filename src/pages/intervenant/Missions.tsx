import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Clock, CheckCircle, AlertTriangle, Navigation, Camera, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Mission {
  id: string;
  demande_etude_id: string;
  statut: string;
  date_debut: string;
  date_fin: string;
  demandes_etudes?: {
    nom_entreprise: string;
    type_etude: string;
    client_id: string;
    description_projet: string;
    zone_geographique: string;
  };
  nom_entreprise?: string;
  type_etude?: string;
  description_projet?: string;
  zone_geographique?: string;
  date_debut_mission?: string;
  date_fin_mission?: string;
  notes_terrain?: string;
  latitude?: number;
  longitude?: number;
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
  statut: string;
  budget_estime: string;
  delai_souhaite: string;
  date_acceptation: string;
  date_debut_mission: string;
  date_fin_mission: string;
  intervenant_id: string;
  client_id: string;
  created_at: string;
}

export default function Missions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [availableDemandes, setAvailableDemandes] = useState<DemandeEtude[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [geoData, setGeoData] = useState<GeolocationData | null>(null);
  const [fieldNotes, setFieldNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMissions();
    }
  }, [user]);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        console.error('Aucun utilisateur connecté');
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, type_compte')
        .eq('user_id', user.id)
        .single();

      if (!profile || profile.type_compte !== 'intervention') {
        console.log('User is not an intervenant:', profile);
        return;
      }

      console.log('Fetching missions for intervenant:', profile.id);

      // Fetch TOUTES les demandes disponibles (en_attente) + mes demandes acceptées
      const { data: toutesLesDemandesData, error: toutesDemandesError } = await supabase
        .from('demandes_etudes')
        .select(`
          id,
          nom_entreprise,
          type_etude,
          description_projet,
          zone_geographique,
          statut,
          budget_estime,
          delai_souhaite,
          date_acceptation,
          date_debut_mission,
          date_fin_mission,
          intervenant_id,
          client_id,
          created_at
        `)
        .or(`statut.eq.en_attente,and(intervenant_id.eq.${profile.id},statut.in.(acceptée,en_cours,terminée))`)
        .order('created_at', { ascending: false });

      if (toutesDemandesError) {
        console.error('Erreur récupération demandes:', toutesDemandesError);
        return;
      }

      console.log('Demandes trouvées:', toutesLesDemandesData);

      // Séparer les demandes disponibles et mes missions
      const demandesDisponibles = toutesLesDemandesData?.filter(d => d.statut === 'en_attente') || [];
      const mesMissions = toutesLesDemandesData?.filter(d => d.intervenant_id === profile.id) || [];

      setAvailableDemandes(demandesDisponibles);
      setMissions(mesMissions);

    } catch (error) {
      console.error('Erreur générale:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour accepter une demande
  const accepterDemande = async (demandeId: string) => {
    try {
      if (!user?.id) return;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Accepter la demande
      const { error } = await supabase
        .from('demandes_etudes')
        .update({
          intervenant_id: profile.id,
          statut: 'acceptée',
          date_acceptation: new Date().toISOString()
        })
        .eq('id', demandeId)
        .eq('statut', 'en_attente'); // Sécurité: seulement si encore en attente

      if (error) {
        console.error('Erreur acceptation demande:', error);
        return;
      }

      // Recharger les données
      fetchMissions();
      
      console.log('Demande acceptée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
    }
  };

  // Fonction pour changer le statut d'une mission
  const changerStatutMission = async (missionId: string, nouveauStatut: string) => {
    try {
      const updateData: any = { statut: nouveauStatut };
      
      if (nouveauStatut === 'en_cours') {
        updateData.date_debut_mission = new Date().toISOString();
      } else if (nouveauStatut === 'terminée') {
        updateData.date_fin_mission = new Date().toISOString();
      }

      const { error } = await supabase
        .from('demandes_etudes')
        .update(updateData)
        .eq('id', missionId);

      if (error) {
        console.error('Erreur changement statut:', error);
        return;
      }

      fetchMissions();
      console.log(`Statut changé vers: ${nouveauStatut}`);
    } catch (error) {
      console.error('Erreur changement statut:', error);
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
          description: `Coordonnées: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
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
        .from('demandes_etudes')
        .update({ 
          statut: 'en_cours',
          date_debut_mission: new Date().toISOString()
        })
        .eq('id', missionId);

      if (error) throw error;

      setMissions(prev => prev.map(m => 
        m.id === missionId 
          ? { ...m, statut: 'en_cours', date_debut_mission: new Date().toISOString() }
          : m
      ));

      toast({
        title: "Mission démarrée",
        description: "La mission a été marquée comme en cours.",
      });
    } catch (error) {
      console.error('Error starting mission:', error);
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
        .from('demandes_etudes')
        .update({
          statut: 'terminée',
          date_fin_mission: new Date().toISOString(),
          description: fieldNotes,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
        })
        .eq('id', selectedMission.id);

      if (error) throw error;

      // Update local state
      setMissions(prev => prev.map(m => 
        m.id === selectedMission.id 
          ? { 
              ...m, 
              statut: 'terminée',
              date_fin_mission: new Date().toISOString(),
              description: fieldNotes,
              latitude: geoData.latitude,
              longitude: geoData.longitude,
            }
          : m
      ));

      toast({
        title: "Données soumises",
        description: "Vos données terrain ont été enregistrées avec succès.",
      });

      // Reset form
      setSelectedMission(null);
      setFieldNotes('');
      setGeoData(null);
    } catch (error) {
      console.error('Error submitting field data:', error);
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
      'assignée': { label: 'Assignée', variant: 'secondary' as const, icon: Clock },
      'en_cours': { label: 'En cours', variant: 'default' as const, icon: Clock },
      'terminée': { label: 'Terminée', variant: 'default' as const, icon: CheckCircle },
      'annulée': { label: 'Annulée', variant: 'destructive' as const, icon: AlertTriangle },
    };
    return statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const, 
      icon: Clock 
    };
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

      <div className="space-y-4">
        {availableDemandes.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold">Demandes Disponibles</h2>
            {availableDemandes.map((demande) => (
              <Card key={demande.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {demande.nom_entreprise}
                      </CardTitle>
                      <CardDescription>
                        Type: {demande.type_etude}
                      </CardDescription>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-1" />
                        {demande.zone_geographique}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button onClick={() => accepterDemande(demande.id)}>
                        Accepter
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {missions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Aucune mission assignée</p>
            </CardContent>
          </Card>
        ) : (
          missions.map((mission) => {
            const status = getStatusBadge(mission.statut);
            const StatusIcon = status.icon;
            
            return (
              <Card key={mission.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {mission.nom_entreprise}
                      </CardTitle>
                      <CardDescription>
                        Type: {mission.type_etude}
                      </CardDescription>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-1" />
                        {mission.zone_geographique}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={status.variant}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Date début:</span>
                        <p className="mt-1">{new Date(mission.date_debut_mission).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Date fin:</span>
                        <p className="mt-1">
                          {mission.date_fin_mission 
                            ? new Date(mission.date_fin_mission).toLocaleDateString('fr-FR')
                            : 'En cours'
                          }
                        </p>
                      </div>
                    </div>
                    
                    {mission.latitude && mission.longitude && (
                      <div className="text-sm">
                        <span className="font-medium text-muted-foreground">Coordonnées:</span>
                        <p className="mt-1">
                          {mission.latitude.toFixed(6)}, {mission.longitude.toFixed(6)}
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {mission.statut === 'en_attente' && (
                        <Button onClick={() => startMission(mission.id)}>
                          <Clock className="w-4 h-4 mr-2" />
                          Démarrer Mission
                        </Button>
                      )}
                      
                      {mission.statut === 'en_cours' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              onClick={() => setSelectedMission(mission)}
                              variant="default"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Saisir Données
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Saisie des Données Terrain</DialogTitle>
                              <DialogDescription>
                                Mission: {mission.nom_entreprise}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              {/* Geolocation Section */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Géolocalisation</label>
                                <div className="flex space-x-2">
                                  <Button 
                                    type="button" 
                                    onClick={getCurrentLocation}
                                    variant="outline"
                                  >
                                    <Navigation className="w-4 h-4 mr-2" />
                                    Obtenir Position
                                  </Button>
                                  {geoData && (
                                    <div className="text-sm text-muted-foreground flex items-center">
                                      <MapPin className="w-4 h-4 mr-1" />
                                      {geoData.latitude.toFixed(6)}, {geoData.longitude.toFixed(6)}
                                      <span className="ml-2">
                                        (±{geoData.accuracy.toFixed(0)}m)
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Field Notes */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Notes de terrain</label>
                                <Textarea
                                  placeholder="Saisissez vos observations, mesures et remarques..."
                                  value={fieldNotes}
                                  onChange={(e) => setFieldNotes(e.target.value)}
                                  rows={6}
                                />
                              </div>
                            </div>

                            <DialogFooter>
                              <DialogTrigger asChild>
                                <Button variant="outline">Annuler</Button>
                              </DialogTrigger>
                              <Button 
                                onClick={submitFieldData}
                                disabled={!geoData || !fieldNotes.trim() || isSubmitting}
                              >
                                {isSubmitting ? "Envoi..." : "Soumettre Données"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
