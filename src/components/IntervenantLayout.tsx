import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, 
  MapPin, 
  FileText, 
  MessageSquare, 
  LogOut,
  Menu,
  X,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface UserProfile {
  nom: string;
  prenom: string;
  type_compte: string;
}

export default function IntervenantLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      if (!user?.id) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('nom, prenom, type_compte')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (profile?.type_compte !== 'intervention') {
        // Redirect non-intervenant users
        return;
      }

      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated or not intervenant
  if (!user || !userProfile || userProfile.type_compte !== 'intervention') {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    {
      name: 'Accueil',
      href: '/',
      icon: Home,
      current: false
    },
    {
      name: 'Tableau de bord',
      href: '/intervenant/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === '/intervenant/dashboard'
    },
    {
      name: 'Missions Terrain',
      href: '/intervenant/missions',
      icon: MapPin,
      current: location.pathname === '/intervenant/missions'
    },
    {
      name: 'Rapports',
      href: '/intervenant/reports',
      icon: FileText,
      current: location.pathname === '/intervenant/reports'
    },
    {
      name: 'Messagerie',
      href: '/intervenant/messages',
      icon: MessageSquare,
      current: location.pathname === '/intervenant/messages'
    }
  ];

  const NavigationItems = () => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              item.current
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Icon className="mr-3 h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          {/* Mobile menu button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col space-y-4 py-4">
                <div className="px-3 py-2">
                  <h2 className="mb-2 px-2 text-lg font-semibold">
                    Espace Intervenant
                  </h2>
                </div>
                <nav className="flex flex-col space-y-1">
                  <NavigationItems />
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link to="/intervenant/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">PA</span>
              </div>
              <span className="font-bold text-lg hidden sm:inline-block">
                Pure Atmos - Intervenant
              </span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end space-x-4">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <NavigationItems />
            </nav>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={userProfile.prenom} />
                    <AvatarFallback>
                      {userProfile.prenom[0]}{userProfile.nom[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userProfile.prenom} {userProfile.nom}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Intervenant terrain
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6">
        <Outlet />
      </main>
    </div>
  );
}
