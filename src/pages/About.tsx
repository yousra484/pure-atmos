import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Target, Globe, BarChart3 } from 'lucide-react';
import { translations } from '@/utils/translations';
import { useAppContext } from '@/context/AppContext';

const About = () => {
  const { language, setLanguage, country, setCountry } = useAppContext();
  const t = translations[language as keyof typeof translations];
  
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as any);
  };
  
  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry as any);
  };

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-hero">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {t.aboutTitle}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {t.aboutDescription}
              </p>
              
              {/* Video Presentation */}
              <div className="mt-12 mb-8 rounded-xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
                <div className="aspect-video bg-black/10 relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button 
                      size="lg" 
                      className="rounded-full h-20 w-20 bg-primary/90 hover:bg-primary transition-all"
                      onClick={() => {
                        // Lien vers la vidéo de présentation
                        window.open('https://www.youtube.com/embed/VOTYOURVIDEOID', '_blank');
                      }}
                    >
                      <Play className="h-10 w-10 ml-1" />
                    </Button>
                  </div>
                  <img 
                    src="/images/video-thumbnail.jpg" 
                    alt={t.videoAltText}
                    className="w-full h-full object-cover opacity-70"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Approach */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-6">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{t.ourMission}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t.missionDescription}
                </p>
              </Card>
              
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="p-4 bg-atmos-green/10 rounded-full w-fit mx-auto mb-6">
                  <Globe className="h-8 w-8 text-atmos-green" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{t.ourVision}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t.visionDescription}
                </p>
              </Card>
              
              <Card className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="p-4 bg-atmos-blue/10 rounded-full w-fit mx-auto mb-6">
                  <BarChart3 className="h-8 w-8 text-atmos-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{t.ourApproach}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t.approachDescription}
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Company Values */}
        <section className="py-16 bg-muted/50">
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
                <div className="h-12 w-12 bg-atmos-blue text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{t.airQualityImprovement}</h3>
                <p className="text-sm text-muted-foreground">{t.airQualityDesc}</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-atmos-green text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{t.sustainableDevelopment}</h3>
                <p className="text-sm text-muted-foreground">{t.sustainableDesc}</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-primary text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{t.scientificResearch}</h3>
                <p className="text-sm text-muted-foreground">{t.researchDesc}</p>
              </Card>

              <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-accent text-white rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{t.publicAwareness}</h3>
                <p className="text-sm text-muted-foreground">{t.awarenessDesc}</p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;