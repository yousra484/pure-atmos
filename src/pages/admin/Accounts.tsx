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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  UserPlus,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Profile {
  id: string;
  nom_complet: string;
  email: string;
  telephone: string;
  type_compte: string;
  pays: string;
  ville: string;
  entreprise: string;
  created_at: string;
  is_active: boolean;
}

const Accounts = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchTerm, selectedType, selectedCountry]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("type_compte", ["client", "intervention"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Add is_active property (you may want to add this column to the database)
      const profilesWithStatus = (data || []).map(profile => ({
        ...profile,
        is_active: true, // Default to true, you can implement actual logic
      }));

      setProfiles(profilesWithStatus);
      setFilteredProfiles(profilesWithStatus);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les comptes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = [...profiles];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.nom_complet.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.entreprise?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by account type
    if (selectedType !== "all") {
      filtered = filtered.filter((p) => p.type_compte === selectedType);
    }

    // Filter by country
    if (selectedCountry !== "all") {
      filtered = filtered.filter((p) => p.pays === selectedCountry);
    }

    setFilteredProfiles(filtered);
  };

  const handleToggleStatus = async (profile: Profile) => {
    try {
      // TODO: Implement actual status toggle in database
      const updatedProfiles = profiles.map((p) =>
        p.id === profile.id ? { ...p, is_active: !p.is_active } : p
      );
      setProfiles(updatedProfiles);
      
      toast({
        title: "Statut modifié",
        description: `Le compte de ${profile.nom_complet} a été ${
          profile.is_active ? "désactivé" : "activé"
        }.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du compte.",
        variant: "destructive",
      });
    }
  };

  const getAccountTypeBadge = (type: string) => {
    const typeConfig: { [key: string]: { variant: any; label: string } } = {
      client: { variant: "default", label: "Client" },
      intervention: { variant: "secondary", label: "Intervenant" },
    };

    const config = typeConfig[type] || { variant: "outline", label: type };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCountryName = (code: string) => {
    const countries: { [key: string]: string } = {
      algerie: "Algérie",
      kenya: "Kenya",
      tanzanie: "Tanzanie",
    };
    return countries[code] || code;
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
        <div className="text-lg">Chargement des comptes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des comptes</h1>
          <p className="text-muted-foreground">
            Gérez les comptes clients et intervenants
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Nouveau compte
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total comptes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profiles.filter((p) => p.type_compte === "client").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Intervenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profiles.filter((p) => p.type_compte === "intervention").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Comptes actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profiles.filter((p) => p.is_active).length}
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
                placeholder="Rechercher par nom, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="intervention">Intervenants</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <MapPin className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tous les pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pays</SelectItem>
                <SelectItem value="algerie">🇩🇿 Algérie</SelectItem>
                <SelectItem value="kenya">🇰🇪 Kenya</SelectItem>
                <SelectItem value="tanzanie">🇹🇿 Tanzanie</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des comptes ({filteredProfiles.length})</CardTitle>
          <CardDescription>
            Cliquez sur un compte pour voir les détails
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Aucun compte trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{profile.nom_complet}</div>
                          {profile.entreprise && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Building className="h-3 w-3" />
                              {profile.entreprise}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getAccountTypeBadge(profile.type_compte)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{getCountryFlag(profile.pays)}</span>
                          <span className="text-sm">
                            {getCountryName(profile.pays)}
                            {profile.ville && `, ${profile.ville}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {profile.email}
                          </div>
                          {profile.telephone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {profile.telephone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(profile.created_at), "dd MMM yyyy", { locale: fr })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {profile.is_active ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Inactif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProfile(profile);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(profile)}
                          >
                            {profile.is_active ? (
                              <Ban className="h-4 w-4 text-destructive" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le compte</DialogTitle>
            <DialogDescription>
              Modifiez les informations du compte utilisateur
            </DialogDescription>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom complet</label>
                <Input value={selectedProfile.nom_complet} disabled />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={selectedProfile.email} disabled />
              </div>
              <div>
                <label className="text-sm font-medium">Type de compte</label>
                <Select value={selectedProfile.type_compte} disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="intervention">Intervenant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => {
              toast({
                title: "Fonctionnalité en développement",
                description: "La modification sera bientôt disponible.",
              });
              setIsEditDialogOpen(false);
            }}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Accounts;
