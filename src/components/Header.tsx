import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LanguageSelector } from './LanguageSelector';
import { CountrySelector } from './CountrySelector';
import { Menu, X, User, Users, Settings, LogOut, BarChart3, ShoppingCart, Download, Heart, Clock, MapPin, FileText, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { translations } from '@/utils/translations';
import { useAuth } from '@/hooks/useAuth';
import { useAppContext } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ type_compte: string } | null>(null);
  const { user, logout } = useAuth();
  const { language, country, setLanguage, setCountry } = useAppContext();
  const t = translations[language as keyof typeof translations];

  const fetchUserProfile = useCallback(async () => {
    try {
      if (!user?.id) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('type_compte')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user, fetchUserProfile]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as 'fr' | 'en' | 'ar');
  };

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry as 'dz' | 'ma' | 'tn' | 'other');
  };

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Pure Atmos Logo" 
              className="h-10 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground">Pure Atmos</h1>
              <p className="text-xs text-muted-foreground">Solutions Services</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              {t.home}
            </Link>
            <Link to="/services" className="text-foreground hover:text-primary transition-colors">
              {t.services}
            </Link>
            <Link to="/countries" className="text-foreground hover:text-primary transition-colors">
              {t.countries}
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              {t.about}
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
              {t.contact}
            </Link>
          </nav>

          {/* Access Buttons & Selectors */}
          <div className="flex items-center space-x-2">
            {/* Country & Language Selectors */}
            <div className="hidden sm:flex items-center space-x-2">
              <CountrySelector 
                currentCountry={country} 
                onCountryChange={handleCountryChange}
                translations={t}
              />
              <LanguageSelector 
                currentLanguage={language} 
                onLanguageChange={handleLanguageChange}
              />
            </div>

            {/* Auth Section */}
            <div className="hidden lg:flex items-center space-x-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      {userProfile?.type_compte === 'intervention' ? 'Espace Intervenant' : t.clientArea}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-1">
                    {userProfile?.type_compte === 'intervention' ? (
                      <>
                        <DropdownMenuItem asChild className="p-0">
                          <Link to="/intervenant/dashboard" className="w-full px-2 py-1.5 flex items-center">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Tableau de bord
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="p-0">
                          <Link to="/intervenant/missions" className="w-full px-2 py-1.5 flex items-center">
                            <MapPin className="mr-2 h-4 w-4" />
                            Missions Terrain
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="p-0">
                          <Link to="/intervenant/reports" className="w-full px-2 py-1.5 flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            Rapports
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="p-0">
                          <Link to="/intervenant/messages" className="w-full px-2 py-1.5 flex items-center">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Messagerie
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild className="p-0">
                          <Link to="/client/dashboard" className="w-full px-2 py-1.5 flex items-center">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Tableau de bord
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="p-0">
                          <Link to="/client/orders" className="w-full px-2 py-1.5 flex items-center">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {t.orderTracking}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="p-0">
                          <Link to="/client/reports" className="w-full px-2 py-1.5 flex items-center">
                            <Download className="mr-2 h-4 w-4" />
                            {t.reportDownload}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="p-0">
                          <Link to="/client/advice" className="w-full px-2 py-1.5 flex items-center">
                            <Heart className="mr-2 h-4 w-4" />
                            {t.personalizedAdvice}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="p-0">
                          <Link to="/client/history" className="w-full px-2 py-1.5 flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            {t.historyBilling}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem asChild className="p-0">
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          const logoutButton = e.currentTarget;
                          const originalContent = logoutButton.innerHTML;
                          
                          // Fonction pour réinitialiser le bouton
                          const resetButton = () => {
                            if (logoutButton) {
                              logoutButton.disabled = false;
                              logoutButton.innerHTML = originalContent;
                            }
                          };
                          
                          try {
                            // Afficher un indicateur de chargement
                            logoutButton.disabled = true;
                            logoutButton.innerHTML = 'Déconnexion en cours...';
                            
                            // Appeler la fonction de déconnexion
                            try {
                              await logout();
                              // Si on arrive ici, la déconnexion a réussi
                              // Rediriger vers la page d'accueil après une déconnexion réussie
                              window.location.href = '/';
                              return; // On sort de la fonction
                            } catch (error) {
                              console.error('Erreur lors de la déconnexion (interne):', error);
                              throw error; // Relancer l'erreur pour le bloc catch externe
                            }
                          } catch (error) {
                            console.error('Erreur lors de la déconnexion (externe):', error);
                            // Réactiver le bouton en cas d'erreur
                            resetButton();
                            
                            // Afficher un message d'erreur à l'utilisateur
                            alert('Une erreur est survenue lors de la déconnexion. Veuillez réessayer.');
                          }
                        }}
                        className="w-full text-left px-2 py-1.5 text-destructive hover:bg-destructive/10 flex items-center"
                      >
                        <>
                          <LogOut className="mr-2 h-4 w-4" />
                          Déconnexion
                        </>
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    Login
                  </Button>
                </Link>
              )}
              
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t bg-card">
            <nav className="flex flex-col space-y-3">
              <Link to="/" className="text-foreground hover:text-primary transition-colors">
                {t.home}
              </Link>
              <Link to="/services" className="text-foreground hover:text-primary transition-colors">
                {t.services}
              </Link>
              <Link to="/countries" className="text-foreground hover:text-primary transition-colors">
                {t.countries}
              </Link>
              <a href="#about" className="text-foreground hover:text-primary transition-colors">
                {t.about}
              </a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors">
                {t.contact}
              </a>
              
              <div className="flex items-center space-x-2 pt-2">
                <CountrySelector 
                  currentCountry={country} 
                  onCountryChange={handleCountryChange}
                  translations={t}
                />
                <LanguageSelector 
                  currentLanguage={language} 
                  onLanguageChange={handleLanguageChange}
                />
              </div>
              
              <div className="flex flex-col space-y-2 pt-2">
                {user ? (
                  <>
                    {userProfile?.type_compte === 'intervention' ? (
                      <>
                        <Link to="/intervenant/dashboard" className="w-full">
                          <Button variant="outline" size="sm" className="gap-2 justify-start w-full">
                            <BarChart3 className="h-4 w-4" />
                            Tableau de bord
                          </Button>
                        </Link>
                        <Link to="/intervenant/missions" className="w-full">
                          <Button variant="outline" size="sm" className="gap-2 justify-start w-full">
                            <MapPin className="h-4 w-4" />
                            Missions Terrain
                          </Button>
                        </Link>
                        <Link to="/intervenant/reports" className="w-full">
                          <Button variant="outline" size="sm" className="gap-2 justify-start w-full">
                            <FileText className="h-4 w-4" />
                            Rapports
                          </Button>
                        </Link>
                        <Link to="/intervenant/messages" className="w-full">
                          <Button variant="outline" size="sm" className="gap-2 justify-start w-full">
                            <MessageSquare className="h-4 w-4" />
                            Messagerie
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/client/dashboard" className="w-full">
                          <Button variant="outline" size="sm" className="gap-2 justify-start w-full">
                            <BarChart3 className="h-4 w-4" />
                            Tableau de bord
                          </Button>
                        </Link>
                        <Link to="/client/orders" className="w-full">
                          <Button variant="outline" size="sm" className="gap-2 justify-start w-full">
                            <ShoppingCart className="h-4 w-4" />
                            Suivi de commandes
                          </Button>
                        </Link>
                        <Link to="/client/reports" className="w-full">
                          <Button variant="outline" size="sm" className="gap-2 justify-start w-full">
                            <Download className="h-4 w-4" />
                            Rapports
                          </Button>
                        </Link>
                        <Link to="/client/advice" className="w-full">
                          <Button variant="outline" size="sm" className="gap-2 justify-start w-full">
                            <Heart className="h-4 w-4" />
                            Conseils
                          </Button>
                        </Link>
                        <Link to="/client/history" className="w-full">
                          <Button variant="outline" size="sm" className="gap-2 justify-start w-full">
                            <Clock className="h-4 w-4" />
                            Historique
                          </Button>
                        </Link>
                      </>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 justify-start w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          await logout();
                          window.location.href = '/';
                        } catch (error) {
                          console.error('Erreur lors de la déconnexion:', error);
                        }
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="gap-2 justify-start w-full">
                      <User className="h-4 w-4" />
                      Login
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" className="gap-2 justify-start w-full">
                  <Settings className="h-4 w-4" />
                  {t.adminAccess}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}