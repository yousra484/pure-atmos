import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LanguageSelector } from './LanguageSelector';
import { CountrySelector } from './CountrySelector';
import { Menu, X, User, Users, Settings, LogOut, BarChart3, ShoppingCart, Download, Heart, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { translations } from '@/utils/translations';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  language: string;
  country: string;
  onLanguageChange: (lang: string) => void;
  onCountryChange: (country: string) => void;
}

export function Header({ language, country, onLanguageChange, onCountryChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const t = translations[language as keyof typeof translations];

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/eefd4b80-ad21-48be-86d4-442a67f14076.png" 
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
                onCountryChange={onCountryChange}
                translations={t}
              />
              <LanguageSelector 
                currentLanguage={language} 
                onLanguageChange={onLanguageChange}
              />
            </div>

            {/* Auth Section */}
            <div className="hidden lg:flex items-center space-x-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      Espace Client
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Tableau de bord
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Suivi de commandes / demandes
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Téléchargement de rapports
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Heart className="mr-2 h-4 w-4" />
                      Conseils personnalisés
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Clock className="mr-2 h-4 w-4" />
                      Historique et facturation
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
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
                  onCountryChange={onCountryChange}
                  translations={t}
                />
                <LanguageSelector 
                  currentLanguage={language} 
                  onLanguageChange={onLanguageChange}
                />
              </div>
              
              <div className="flex flex-col space-y-2 pt-2">
                {user ? (
                  <>
                    <Button variant="outline" size="sm" className="gap-2 justify-start w-full">
                      <BarChart3 className="h-4 w-4" />
                      Tableau de bord
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 justify-start w-full">
                      <ShoppingCart className="h-4 w-4" />
                      Suivi de commandes
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 justify-start w-full">
                      <Download className="h-4 w-4" />
                      Rapports
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 justify-start w-full">
                      <Heart className="h-4 w-4" />
                      Conseils
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 justify-start w-full">
                      <Clock className="h-4 w-4" />
                      Historique
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 justify-start w-full" onClick={logout}>
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