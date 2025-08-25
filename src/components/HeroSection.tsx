import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Play, Leaf, Wind, BarChart3 } from 'lucide-react';
import { translations } from '@/utils/translations';
import { useAppContext } from '@/context/AppContext';

export function HeroSection() {
  const { language } = useAppContext();
  const t = translations[language as keyof typeof translations];

  return (
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
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2">
                {t.startStudy}
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Play className="h-5 w-5" />
                {t.contactExpert}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-muted-foreground">Pays</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Études</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
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
                <h3 className="font-semibold">Analyse Air</h3>
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
  );
}