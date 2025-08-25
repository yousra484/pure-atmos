import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Send } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

const StartStudy = () => {
  const { language, setLanguage, country, setCountry } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as any);
  };
  
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry as any);
  };

  const [formData, setFormData] = useState({
    nom_entreprise: '',
    secteur_activite: '',
    type_etude: '',
    description_projet: '',
    zone_geographique: '',
    budget_estime: '',
    delai_souhaite: '',
    contact_nom: '',
    contact_email: '',
    contact_telephone: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour soumettre une demande d'étude.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      // First, get the user's profile ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error('Impossible de récupérer le profil utilisateur');
      }

      // Insert the study request with the correct profile ID
      const { data, error } = await supabase
        .from('demandes_etudes')
        .insert({
          ...formData,
          client_id: profile.id,
          statut: 'en_attente'
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur détaillée:', error);
        throw error;
      }

      toast({
        title: "Demande soumise avec succès",
        description: "Nous examinerons votre demande et vous contacterons bientôt.",
      });

      navigate('/client/dashboard');
    } catch (error) {
      console.error('Error submitting study request:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission de votre demande.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header />

      <main className="py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </div>

          <Card className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Commencer une Étude Environnementale
              </h1>
              <p className="text-muted-foreground">
                Remplissez ce formulaire pour nous faire part de vos besoins en matière d'étude environnementale
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nom_entreprise">Nom de l'entreprise *</Label>
                  <Input
                    id="nom_entreprise"
                    value={formData.nom_entreprise}
                    onChange={(e) => handleInputChange('nom_entreprise', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secteur_activite">Secteur d'activité *</Label>
                  <Select value={formData.secteur_activite} onValueChange={(value) => handleInputChange('secteur_activite', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="industrie">Industrie</SelectItem>
                      <SelectItem value="agriculture">Agriculture</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="energie">Énergie</SelectItem>
                      <SelectItem value="batiment">Bâtiment et construction</SelectItem>
                      <SelectItem value="chimie">Chimie et pétrochimie</SelectItem>
                      <SelectItem value="agroalimentaire">Agroalimentaire</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="type_etude">Type d'étude *</Label>
                  <Select value={formData.type_etude} onValueChange={(value) => handleInputChange('type_etude', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le type d'étude" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qualite_air">Qualité de l'air</SelectItem>
                      <SelectItem value="emission_gaz">Émissions de gaz</SelectItem>
                      <SelectItem value="pollution_sonore">Pollution sonore</SelectItem>
                      <SelectItem value="impact_environnemental">Impact environnemental</SelectItem>
                      <SelectItem value="audit_carbone">Audit carbone</SelectItem>
                      <SelectItem value="conformite_reglementaire">Conformité réglementaire</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zone_geographique">Zone géographique *</Label>
                  <Input
                    id="zone_geographique"
                    value={formData.zone_geographique}
                    onChange={(e) => handleInputChange('zone_geographique', e.target.value)}
                    placeholder="Ex: Alger, Oran, Constantine..."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_projet">Description du projet *</Label>
                <Textarea
                  id="description_projet"
                  value={formData.description_projet}
                  onChange={(e) => handleInputChange('description_projet', e.target.value)}
                  placeholder="Décrivez votre projet et vos objectifs d'étude..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="budget_estime">Budget estimé</Label>
                  <Select value={formData.budget_estime} onValueChange={(value) => handleInputChange('budget_estime', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moins_10k">Moins de 10 000 DA</SelectItem>
                      <SelectItem value="10k_50k">10 000 - 50 000 DA</SelectItem>
                      <SelectItem value="50k_100k">50 000 - 100 000 DA</SelectItem>
                      <SelectItem value="100k_500k">100 000 - 500 000 DA</SelectItem>
                      <SelectItem value="plus_500k">Plus de 500 000 DA</SelectItem>
                      <SelectItem value="a_discuter">À discuter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delai_souhaite">Délai souhaité</Label>
                  <Select value={formData.delai_souhaite} onValueChange={(value) => handleInputChange('delai_souhaite', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez le délai" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent (1-2 semaines)</SelectItem>
                      <SelectItem value="1_mois">Dans le mois</SelectItem>
                      <SelectItem value="3_mois">Dans les 3 mois</SelectItem>
                      <SelectItem value="6_mois">Dans les 6 mois</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Informations de contact</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contact_nom">Nom du contact *</Label>
                    <Input
                      id="contact_nom"
                      value={formData.contact_nom}
                      onChange={(e) => handleInputChange('contact_nom', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Email *</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_telephone">Téléphone</Label>
                    <Input
                      id="contact_telephone"
                      value={formData.contact_telephone}
                      onChange={(e) => handleInputChange('contact_telephone', e.target.value)}
                      placeholder="+213 ..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    "Envoi en cours..."
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Soumettre la demande
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StartStudy;