import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { translations } from '@/utils/translations';
import { useAuth } from '@/hooks/useAuth';

interface SignUpProps {
  language: string;
  country: string;
  onLanguageChange: (lang: string) => void;
  onCountryChange: (country: string) => void;
}

const SignUp = ({ language, country }: SignUpProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
    address: '',
    specialization: '',
    experience: ''
  });
  const [accountType, setAccountType] = useState('client');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const t = translations[language as keyof typeof translations] || translations.fr;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert(t.passwordMismatch);
      return;
    }

    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    setIsLoading(true);
    try {
      const userData = {
        nom: formData.lastName,
        prenom: formData.firstName,
        type_compte: accountType,
        telephone: formData.phone,
        entreprise: formData.company,
        specialisation: formData.specialization,
        experience: formData.experience ? parseInt(formData.experience) : null,
        pays: country
      };
      
      await signUp(formData.email, formData.password, userData);
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg border-border/50">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-foreground">
            {t.createAccount}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t.signUpDescription}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-firstName">{t.firstName}</Label>
                    <Input
                      id="client-firstName"
                      placeholder={t.firstNamePlaceholder}
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-lastName">{t.lastName}</Label>
                    <Input
                      id="client-lastName"
                      placeholder={t.lastNamePlaceholder}
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client-email">{t.email}</Label>
                  <Input
                    id="client-email"
                    type="email"
                    placeholder={t.authEmailPlaceholder}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client-phone">{t.phone}</Label>
                  <Input
                    id="client-phone"
                    type="tel"
                    placeholder={t.phonePlaceholder}
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client-company">{t.company}</Label>
                  <Input
                    id="client-company"
                    placeholder={t.companyPlaceholder}
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-password">{t.password}</Label>
                    <Input
                      id="client-password"
                      type="password"
                      placeholder={t.passwordPlaceholder}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-confirmPassword">{t.confirmPassword}</Label>
                    <Input
                      id="client-confirmPassword"
                      type="password"
                      placeholder={t.confirmPasswordPlaceholder}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Création...' : t.signUpAsClient}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="intervention" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="intervention-firstName">{t.firstName}</Label>
                    <Input
                      id="intervention-firstName"
                      placeholder={t.firstNamePlaceholder}
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="intervention-lastName">{t.lastName}</Label>
                    <Input
                      id="intervention-lastName"
                      placeholder={t.lastNamePlaceholder}
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="intervention-email">{t.email}</Label>
                  <Input
                    id="intervention-email"
                    type="email"
                    placeholder={t.authEmailPlaceholder}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="intervention-phone">{t.phone}</Label>
                  <Input
                    id="intervention-phone"
                    type="tel"
                    placeholder={t.phonePlaceholder}
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="intervention-specialization">{t.specialization}</Label>
                  <Input
                    id="intervention-specialization"
                    placeholder={t.specializationPlaceholder}
                    value={formData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="intervention-experience">{t.experience}</Label>
                  <Textarea
                    id="intervention-experience"
                    placeholder={t.experiencePlaceholder}
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="intervention-password">{t.password}</Label>
                    <Input
                      id="intervention-password"
                      type="password"
                      placeholder={t.passwordPlaceholder}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="intervention-confirmPassword">{t.confirmPassword}</Label>
                    <Input
                      id="intervention-confirmPassword"
                      type="password"
                      placeholder={t.confirmPasswordPlaceholder}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Création...' : t.signUpAsIntervention}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              {t.alreadyHaveAccount}{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                {t.login}
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

export default SignUp;