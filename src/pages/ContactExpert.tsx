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
import { ArrowLeft, MessageCircle, Phone, Mail } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

const ContactExpert = () => {
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
    nom: '',
    email: '',
    telephone: '',
    entreprise: '',
    sujet: '',
    message: '',
    type_consultation: '',
    urgence: 'normale'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contacts_experts')
        .insert({
          ...formData,
          client_id: user?.id || null
        });

      if (error) throw error;

      toast({
        title: "Message envoyé avec succès",
        description: "Un expert vous contactera dans les plus brefs délais.",
      });

      navigate('/');
    } catch (error) {
      console.error('Error submitting expert contact:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre message.",
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

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulaire de contact */}
            <div className="lg:col-span-2">
              <Card className="p-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-foreground mb-4">
                    Contacter un Expert
                  </h1>
                  <p className="text-muted-foreground">
                    Obtenez des conseils personnalisés de nos experts en environnement
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom complet *</Label>
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => handleInputChange('nom', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="telephone">Téléphone</Label>
                      <Input
                        id="telephone"
                        value={formData.telephone}
                        onChange={(e) => handleInputChange('telephone', e.target.value)}
                        placeholder="+213 ..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="entreprise">Entreprise</Label>
                      <Input
                        id="entreprise"
                        value={formData.entreprise}
                        onChange={(e) => handleInputChange('entreprise', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="type_consultation">Type de consultation *</Label>
                      <Select value={formData.type_consultation} onValueChange={(value) => handleInputChange('type_consultation', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez le type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="audit_environnemental">Audit environnemental</SelectItem>
                          <SelectItem value="conformite_reglementaire">Conformité réglementaire</SelectItem>
                          <SelectItem value="qualite_air">Qualité de l'air</SelectItem>
                          <SelectItem value="emission_carbone">Émission carbone</SelectItem>
                          <SelectItem value="formation">Formation</SelectItem>
                          <SelectItem value="conseil_strategique">Conseil stratégique</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="urgence">Niveau d'urgence</Label>
                      <Select value={formData.urgence} onValueChange={(value) => handleInputChange('urgence', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="faible">Faible</SelectItem>
                          <SelectItem value="normale">Normale</SelectItem>
                          <SelectItem value="elevee">Élevée</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sujet">Sujet *</Label>
                    <Input
                      id="sujet"
                      value={formData.sujet}
                      onChange={(e) => handleInputChange('sujet', e.target.value)}
                      placeholder="Résumez votre demande en quelques mots"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message détaillé *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Décrivez votre problématique en détail..."
                      className="min-h-[150px]"
                      required
                    />
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
                          <MessageCircle className="h-4 w-4" />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Informations de contact et assistance */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Nos Experts</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Consultation en ligne</p>
                      <p className="text-sm text-muted-foreground">Réponse sous 24h</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-atmos-green/10 rounded-lg">
                      <Phone className="h-4 w-4 text-atmos-green" />
                    </div>
                    <div>
                      <p className="font-medium">Consultation téléphonique</p>
                      <p className="text-sm text-muted-foreground">Sur rendez-vous</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-atmos-blue/10 rounded-lg">
                      <Mail className="h-4 w-4 text-atmos-blue" />
                    </div>
                    <div>
                      <p className="font-medium">Support email</p>
                      <p className="text-sm text-muted-foreground">support@pureatmos.com</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Domaines d'expertise</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">Qualité de l'air</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">Émissions industrielles</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">Conformité réglementaire</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">Audit carbone</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">Développement durable</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-primary/5 to-atmos-green/5">
                <h3 className="text-lg font-semibold mb-2">Besoin d'aide immédiate ?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Pour les urgences environnementales, contactez-nous directement.
                </p>
                <Button variant="outline" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  +213 123 456 789
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactExpert;