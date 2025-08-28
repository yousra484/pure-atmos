import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Send, Phone, Mail, MapPin, Clock, User, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAppContext } from '@/context/AppContext';

const Contact = () => {
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
    entreprise: '',
    telephone: '',
    sujet: '',
    message: '',
    type_consultation: 'general',
    urgence: 'normale'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Sauvegarder dans la base de données
      const { error } = await supabase
        .from('contacts_experts')
        .insert([
          { 
            ...formData,
            client_id: user?.id || null,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      // Envoyer l'email via le serveur dans le dossier server/
      try {
        const emailResponse = await fetch('http://localhost:3001/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nom: formData.nom,
            email: formData.email,
            entreprise: formData.entreprise,
            telephone: formData.telephone,
            sujet: formData.sujet,
            message: formData.message
          })
        });

        const emailResult = await emailResponse.json();
        
        if (emailResult.success) {
          console.log('Email envoyé avec succès:', emailResult.messageId);
        } else {
          console.warn('Erreur envoi email:', emailResult.message);
        }
      } catch (emailError) {
        console.warn('Serveur email non disponible. Message sauvegardé en base de données uniquement.');
      }

      toast({
        title: "Message envoyé avec succès",
        description: "Nous vous répondrons dans les plus brefs délais.",
      });

      // Reset form
      setFormData({
        nom: '',
        email: '',
        entreprise: '',
        telephone: '',
        sujet: '',
        message: '',
        type_consultation: 'general',
        urgence: 'normale'
      });
      
    } catch (error) {
      console.error('Error submitting contact form:', error);
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

      <main className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </div>

          <h1 className="text-4xl font-bold text-center mb-4">Contactez-nous</h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Notre équipe est à votre écoute pour répondre à toutes vos questions.
          </p>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Coordonnées */}
            <div className="space-y-8">
              <Card className="p-8 h-full">
                <h2 className="text-2xl font-bold mb-8">Nos Coordonnées</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Téléphone</h3>
                      <a 
                        href="tel:+213559345440" 
                        className="text-muted-foreground hover:text-foreground transition-colors text-base"
                      >
                        +213 559 34 54 40
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Email</h3>
                      <a 
                        href="mailto:pureatmos@gmail.com" 
                        className="text-muted-foreground hover:text-foreground transition-colors text-base"
                      >
                        pureatmos@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Adresse</h3>
                      <address className="not-italic text-muted-foreground text-base">
                        Université de Tlemcen,<br />
                        Abou Bekr Belkaid<br />
                        Département de Biologie
                      </address>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Heures d'ouverture</h3>
                      <p className="text-muted-foreground text-base">
                        Lundi - Vendredi: 9h00 - 17h00<br />
                        Samedi: 9h00 - 12h00
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Formulaire de contact */}
            <div>
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Votre nom</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="nom"
                        type="text"
                        placeholder="Votre nom complet"
                        className="pl-10"
                        value={formData.nom}
                        onChange={(e) => handleInputChange('nom', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Votre email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sujet">Sujet</Label>
                    <Input
                      id="sujet"
                      type="text"
                      placeholder="Objet de votre message"
                      value={formData.sujet}
                      onChange={(e) => handleInputChange('sujet', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="entreprise">Entreprise (optionnel)</Label>
                    <Input
                      id="entreprise"
                      type="text"
                      placeholder="Votre entreprise"
                      value={formData.entreprise}
                      onChange={(e) => handleInputChange('entreprise', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telephone">Téléphone (optionnel)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="telephone"
                        type="tel"
                        placeholder="Votre numéro de téléphone"
                        className="pl-10"
                        value={formData.telephone}
                        onChange={(e) => handleInputChange('telephone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Votre message</Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Textarea
                        id="message"
                        placeholder="Décrivez-nous votre demande..."
                        className="min-h-[150px] pl-10"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        'Envoi en cours...'
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
