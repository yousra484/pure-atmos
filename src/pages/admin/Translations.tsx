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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Languages,
  Search,
  Plus,
  Edit,
  Save,
  X,
  Check,
  Globe,
  FileText,
  RefreshCw,
  Copy,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Translation {
  id: string;
  key: string;
  section: string;
  fr: string;
  en: string;
  ar: string;
  lastModified: string;
  modifiedBy: string;
}

const Translations = () => {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [filteredTranslations, setFilteredTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSection, setSelectedSection] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("fr");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [editForm, setEditForm] = useState({ fr: "", en: "", ar: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchTranslations();
  }, []);

  useEffect(() => {
    filterTranslations();
  }, [translations, searchTerm, selectedSection]);

  const fetchTranslations = async () => {
    try {
      setLoading(true);
      
      // Mock translations data
      const mockTranslations: Translation[] = [
        {
          id: "1",
          key: "home.title",
          section: "Accueil",
          fr: "Solutions d'analyse atmosphérique pour l'Afrique",
          en: "Atmospheric Analysis Solutions for Africa",
          ar: "حلول تحليل الغلاف الجوي لأفريقيا",
          lastModified: new Date().toISOString(),
          modifiedBy: "Admin",
        },
        {
          id: "2",
          key: "home.subtitle",
          section: "Accueil",
          fr: "Expertise scientifique en pollution de l'air",
          en: "Scientific Expertise in Air Pollution",
          ar: "خبرة علمية في تلوث الهواء",
          lastModified: new Date().toISOString(),
          modifiedBy: "Admin",
        },
        {
          id: "3",
          key: "services.analysis",
          section: "Services",
          fr: "Analyse de la qualité de l'air",
          en: "Air Quality Analysis",
          ar: "تحليل جودة الهواء",
          lastModified: new Date().toISOString(),
          modifiedBy: "Admin",
        },
        {
          id: "4",
          key: "services.sampling",
          section: "Services",
          fr: "Échantillonnage sur terrain",
          en: "Field Sampling",
          ar: "أخذ العينات الميدانية",
          lastModified: new Date().toISOString(),
          modifiedBy: "Admin",
        },
        {
          id: "5",
          key: "contact.title",
          section: "Contact",
          fr: "Contactez-nous",
          en: "Contact Us",
          ar: "اتصل بنا",
          lastModified: new Date().toISOString(),
          modifiedBy: "Admin",
        },
        {
          id: "6",
          key: "contact.email",
          section: "Contact",
          fr: "Adresse e-mail",
          en: "Email Address",
          ar: "عنوان البريد الإلكتروني",
          lastModified: new Date().toISOString(),
          modifiedBy: "Admin",
        },
        {
          id: "7",
          key: "dashboard.welcome",
          section: "Dashboard",
          fr: "Bienvenue sur votre tableau de bord",
          en: "Welcome to your dashboard",
          ar: "مرحبا بك في لوحة التحكم الخاصة بك",
          lastModified: new Date().toISOString(),
          modifiedBy: "Admin",
        },
        {
          id: "8",
          key: "dashboard.orders",
          section: "Dashboard",
          fr: "Mes commandes",
          en: "My Orders",
          ar: "طلباتي",
          lastModified: new Date().toISOString(),
          modifiedBy: "Admin",
        },
      ];

      setTranslations(mockTranslations);
      setFilteredTranslations(mockTranslations);
    } catch (error) {
      console.error("Error fetching translations:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les traductions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTranslations = () => {
    let filtered = [...translations];

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.ar.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSection !== "all") {
      filtered = filtered.filter((t) => t.section === selectedSection);
    }

    setFilteredTranslations(filtered);
  };

  const handleEditTranslation = (translation: Translation) => {
    setEditingTranslation(translation);
    setEditForm({
      fr: translation.fr,
      en: translation.en,
      ar: translation.ar,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveTranslation = () => {
    if (!editingTranslation) return;

    const updatedTranslations = translations.map((t) =>
      t.id === editingTranslation.id
        ? {
            ...t,
            ...editForm,
            lastModified: new Date().toISOString(),
            modifiedBy: "Admin",
          }
        : t
    );

    setTranslations(updatedTranslations);
    toast({
      title: "Traduction mise à jour",
      description: "La traduction a été mise à jour avec succès.",
    });
    setIsEditDialogOpen(false);
    setEditingTranslation(null);
  };

  const handleAddTranslation = () => {
    toast({
      title: "Nouvelle traduction",
      description: "Fonctionnalité en cours de développement.",
    });
  };

  const handleDeleteTranslation = (id: string) => {
    const updatedTranslations = translations.filter((t) => t.id !== id);
    setTranslations(updatedTranslations);
    toast({
      title: "Traduction supprimée",
      description: "La traduction a été supprimée avec succès.",
    });
  };

  const handleExportTranslations = () => {
    toast({
      title: "Export en cours",
      description: "Les traductions sont en cours d'export...",
    });
  };

  const handleImportTranslations = () => {
    toast({
      title: "Import",
      description: "Fonctionnalité d'import en cours de développement.",
    });
  };

  const getSections = () => {
    const sections = [...new Set(translations.map((t) => t.section))];
    return sections;
  };

  const getCompletionStatus = (translation: Translation) => {
    const fields = [translation.fr, translation.en, translation.ar];
    const completed = fields.filter((f) => f && f.trim() !== "").length;
    return {
      completed,
      total: 3,
      percentage: (completed / 3) * 100,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Chargement des traductions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des traductions</h1>
          <p className="text-muted-foreground">
            Gérez les contenus multilingues de la plateforme
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImportTranslations}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Importer
          </Button>
          <Button variant="outline" onClick={handleExportTranslations}>
            <FileText className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button onClick={handleAddTranslation}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle traduction
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total traductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{translations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getSections().length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Langues actives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <div className="text-xs text-muted-foreground">FR, EN, AR</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Complétion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <div className="text-xs text-muted-foreground">Toutes traduites</div>
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
                placeholder="Rechercher une clé ou un texte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <Globe className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Toutes les sections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les sections</SelectItem>
                {getSections().map((section) => (
                  <SelectItem key={section} value={section}>
                    {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger>
                <Languages className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Langue principale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Translations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Traductions ({filteredTranslations.length})</CardTitle>
          <CardDescription>
            Cliquez sur une traduction pour la modifier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clé</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Français</TableHead>
                  <TableHead>English</TableHead>
                  <TableHead>العربية</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTranslations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Aucune traduction trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTranslations.map((translation) => {
                    const status = getCompletionStatus(translation);
                    return (
                      <TableRow key={translation.id}>
                        <TableCell>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {translation.key}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{translation.section}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="truncate" title={translation.fr}>
                            {translation.fr}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="truncate" title={translation.en}>
                            {translation.en}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="truncate text-right" dir="rtl" title={translation.ar}>
                            {translation.ar}
                          </div>
                        </TableCell>
                        <TableCell>
                          {status.percentage === 100 ? (
                            <Badge variant="success" className="gap-1">
                              <Check className="h-3 w-3" />
                              Complet
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              {status.completed}/{status.total}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTranslation(translation)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(translation.key);
                                toast({
                                  title: "Clé copiée",
                                  description: `La clé "${translation.key}" a été copiée.`,
                                });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTranslation(translation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier la traduction</DialogTitle>
            <DialogDescription>
              Modifiez les traductions pour chaque langue
            </DialogDescription>
          </DialogHeader>
          {editingTranslation && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Clé</label>
                <p className="text-sm text-muted-foreground">
                  <code className="bg-muted px-1 py-0.5 rounded">{editingTranslation.key}</code>
                </p>
              </div>
              <Tabs defaultValue="fr" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="fr">Français</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ar">العربية</TabsTrigger>
                </TabsList>
                <TabsContent value="fr">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Texte en français</label>
                    <Textarea
                      value={editForm.fr}
                      onChange={(e) => setEditForm({ ...editForm, fr: e.target.value })}
                      rows={3}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="en">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Text in English</label>
                    <Textarea
                      value={editForm.en}
                      onChange={(e) => setEditForm({ ...editForm, en: e.target.value })}
                      rows={3}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="ar">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">النص بالعربية</label>
                    <Textarea
                      value={editForm.ar}
                      onChange={(e) => setEditForm({ ...editForm, ar: e.target.value })}
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveTranslation}>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Translations;
