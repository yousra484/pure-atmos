import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArrowRight, Play, Leaf, Wind, BarChart3, Globe, MapPin } from 'lucide-react';
import { translations } from '@/utils/translations';
import { useAppContext } from '@/context/AppContext';

const Index = () => {
  const { language } = useAppContext();
  const [selectedCountry, setSelectedCountry] = useState('dz');
  const navigate = useNavigate();
  const t = translations[language as keyof typeof translations];

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header />

      <main>
        {/* Hero Section */}
        <section id="home" className="min-h-[90vh] bg-gradient-hero relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-atmos-light/50 via-background to-atmos-blue/10"></div>
          <div className="absolute top-20 right-10 w-32 h-32 bg-atmos-green/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-40 h-40 bg-atmos-blue/20 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-accent/10 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Leaf className="h-4 w-4" />
                  {t.heroSubtitle}
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                  {t.heroTitle}
                </h1>
                
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                  {t.heroDescription}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Button 
                    size="lg" 
                    className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2"
                    onClick={() => navigate('/start-study')}
                  >
                    {t.startStudy}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="gap-2"
                    onClick={() => navigate('/contact-expert')}
                  >
                    <Play className="h-5 w-5" />
                    {t.contactExpert}
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">3</div>
                    <div className="text-sm text-muted-foreground">{t.countries}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">100+</div>
                    <div className="text-sm text-muted-foreground">{t.studies}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">24/7</div>
                    <div className="text-sm text-muted-foreground">{t.support}</div>
                  </div>
                </div>
              </div>

              {/* Visual Elements */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 shadow-card hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-atmos-blue/10 rounded-lg">
                      <Wind className="h-6 w-6 text-atmos-blue" />
                    </div>
                    <h3 className="font-semibold">{t.airAnalysis}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.analysisCard}</p>
                </Card>

                <Card className="p-6 shadow-card hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-atmos-green/10 rounded-lg">
                      <Leaf className="h-6 w-6 text-atmos-green" />
                    </div>
                    <h3 className="font-semibold">{t.greenSolutions}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.greenSolutionsDesc}</p>
                </Card>

                <Card className="p-6 shadow-card hover:shadow-lg transition-shadow col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">{t.scientificReports}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t.scientificReportsDesc}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <div className="h-2 bg-atmos-blue rounded flex-1"></div>
                    <div className="h-2 bg-atmos-green rounded flex-1"></div>
                    <div className="h-2 bg-accent rounded flex-1"></div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

{/* Environmental Objectives */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {t.environmentalObjectives}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t.objectivesDescription}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <Wind className="h-12 w-12 text-atmos-blue mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t.airQualityImprovement}</h3>
                <p className="text-sm text-muted-foreground">{t.airQualityDesc}</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <Leaf className="h-12 w-12 text-atmos-green mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t.sustainableDevelopment}</h3>
                <p className="text-sm text-muted-foreground">{t.sustainableDesc}</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t.scientificResearch}</h3>
                <p className="text-sm text-muted-foreground">{t.researchDesc}</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <Globe className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t.publicAwareness}</h3>
                <p className="text-sm text-muted-foreground">{t.awarenessDesc}</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Interactive Map Placeholder */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {t.pollutionMap}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t.pollutionMapDesc}
              </p>
            </div>

            <Card className="p-8 text-center bg-gradient-to-br from-atmos-blue/10 to-atmos-green/10">
              <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t.interactiveMap}</h3>
              <p className="text-muted-foreground mb-6">{t.interactiveMapDesc}</p>
              <Button variant="outline">
                {t.viewFullMap}
              </Button>
            </Card>
          </div>
        </section>
      </main>


      <Footer  />
    </div>
  );
};

export default Index;
