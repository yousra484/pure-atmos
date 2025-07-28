import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  Wind, 
  Microscope, 
  FileText, 
  ShieldCheck, 
  Home as HomeIcon,
  Factory,
  TreePine,
  Building2,
  Users,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { translations } from '@/utils/translations';

interface ServicesProps {
  language: string;
  country: string;
  onLanguageChange: (lang: string) => void;
  onCountryChange: (country: string) => void;
}

export default function Services({ language, country, onLanguageChange, onCountryChange }: ServicesProps) {
  const navigate = useNavigate();
  const t = translations[language as keyof typeof translations];

  const services = [
    {
      icon: Wind,
      title: t.airPollutionStudy,
      description: t.airPollutionStudyDesc,
      areas: [t.urbanZone, t.industrialZone, t.ruralZone]
    },
    {
      icon: Users,
      title: t.onSiteSampling,
      description: t.onSiteSamplingDesc,
      areas: [t.certifiedAgents, t.professionalEquipment, t.qualityProtocols]
    },
    {
      icon: Microscope,
      title: t.laboratoryAnalysis,
      description: t.laboratoryAnalysisDesc,
      areas: [t.partnerLabs, t.scientificMethods, t.qualityControl]
    },
    {
      icon: FileText,
      title: t.scientificReport,
      description: t.scientificReportDesc,
      areas: [t.detailedResults, t.multilingualReport, t.recommendations]
    },
    {
      icon: ShieldCheck,
      title: t.exposureReduction,
      description: t.exposureReductionDesc,
      areas: [t.personalizedAdvice, t.preventiveMeasures, t.followUp]
    },
    {
      icon: HomeIcon,
      title: t.indoorAirQuality,
      description: t.indoorAirQualityDesc,
      areas: [t.homeAnalysis, t.officeAnalysis, t.schoolAnalysis]
    }
  ];

  const processSteps = [
    {
      step: 1,
      icon: Calendar,
      title: t.requestStudy,
      description: t.requestStudyDesc
    },
    {
      step: 2,
      icon: Users,
      title: t.fieldIntervention,
      description: t.fieldInterventionDesc
    },
    {
      step: 3,
      icon: Microscope,
      title: t.laboratoryAnalysisStep,
      description: t.laboratoryAnalysisStepDesc
    },
    {
      step: 4,
      icon: FileText,
      title: t.reportDelivery,
      description: t.reportDeliveryDesc
    }
  ];

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header 
        language={language}
        country={country}
        onLanguageChange={onLanguageChange}
        onCountryChange={onCountryChange}
      />

      <main className="py-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {t.ourServices}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t.servicesDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
                onClick={() => navigate('/start-study')}
              >
                {t.startStudy}
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/contact-expert')}
              >
                {t.contactExpert}
              </Button>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="container mx-auto px-4 mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{service.title}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.areas.map((area, areaIndex) => (
                    <li key={areaIndex} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-atmos-green" />
                      {area}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* Process Steps */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {t.ourProcess}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t.processDescription}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-atmos-green rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pollution Areas */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {t.pollutionAreas}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t.pollutionAreasDesc}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="p-4 bg-atmos-blue/10 rounded-full w-fit mx-auto mb-4">
                <Building2 className="h-8 w-8 text-atmos-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t.urbanZone}</h3>
              <p className="text-muted-foreground">{t.urbanZoneDesc}</p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="p-4 bg-atmos-green/10 rounded-full w-fit mx-auto mb-4">
                <Factory className="h-8 w-8 text-atmos-green" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t.industrialZone}</h3>
              <p className="text-muted-foreground">{t.industrialZoneDesc}</p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="p-4 bg-accent/10 rounded-full w-fit mx-auto mb-4">
                <TreePine className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t.ruralZone}</h3>
              <p className="text-muted-foreground">{t.ruralZoneDesc}</p>
            </Card>
          </div>
        </section>
      </main>

      <Footer language={language} />
    </div>
  );
}