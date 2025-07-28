import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { translations } from '@/utils/translations';
import { useAuth } from '@/hooks/useAuth';

interface LoginProps {
  language: string;
  country: string;
  onLanguageChange: (lang: string) => void;
  onCountryChange: (country: string) => void;
}

const Login = ({ language }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('client');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const t = translations[language as keyof typeof translations] || translations.fr;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-foreground">
            {t.login}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t.loginDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={accountType} onValueChange={setAccountType} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="client" className="text-sm">
                {t.clientAccount}
              </TabsTrigger>
              <TabsTrigger value="intervention" className="text-sm">
                {t.interventionAccount}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="client" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-email">{t.email}</Label>
                  <Input
                    id="client-email"
                    type="email"
                    placeholder={t.authEmailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-password">{t.password}</Label>
                  <Input
                    id="client-password"
                    type="password"
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Connexion...' : t.loginAsClient}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="intervention" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="intervention-email">{t.email}</Label>
                  <Input
                    id="intervention-email"
                    type="email"
                    placeholder={t.authEmailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intervention-password">{t.password}</Label>
                  <Input
                    id="intervention-password"
                    type="password"
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Connexion...' : t.loginAsIntervention}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                {t.forgotPassword}
              </Link>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {t.noAccount}{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                {t.signUp}
              </Link>
            </div>
            <div className="text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                {t.backToHome}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;