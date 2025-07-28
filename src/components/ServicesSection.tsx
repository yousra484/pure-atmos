import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Microscope, 
  FlaskConical, 
  FileText, 
  Users, 
  Home,
  Wind,
  ArrowRight
} from 'lucide-react';
import { translations } from '@/utils/translations';

interface ServicesSectionProps {
  language: string;
}

export function ServicesSection({ language }: ServicesSectionProps) {
  const t = translations[language as keyof typeof translations];

  const services = [
    {
      icon: Wind,
      title: t.airQualityStudy,
      description: 'Évaluation complète de la qualité de l\'air selon les zones urbaines, industrielles et rurales',
      color: 'text-atmos-blue',
      bgColor: 'bg-atmos-blue/10'
    },
    {
      icon: Users,
      title: t.fieldSampling,
      description: 'Intervention d\'experts qualifiés pour prélèvements sur site',
      color: 'text-atmos-green',
      bgColor: 'bg-atmos-green/10'
    },
    {
      icon: FlaskConical,
      title: t.labAnalysis,
      description: 'Analyses en laboratoire certifié avec équipements de pointe',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      icon: FileText,
      title: t.scientificReports,
      description: 'Rapports détaillés multilingues (FR/EN/AR) avec recommandations',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      icon: Microscope,
      title: t.personalizedAdvice,
      description: 'Conseils adaptés pour réduire l\'exposition aux polluants',
      color: 'text-atmos-blue',
      bgColor: 'bg-atmos-blue/10'
    },
    {
      icon: Home,
      title: t.indoorAirDiagnostic,
      description: 'Diagnostic spécialisé de la qualité de l\'air intérieur',
      color: 'text-atmos-green',
      bgColor: 'bg-atmos-green/10'
    }
  ];

  return (
    <section id="services" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t.servicesTitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'fr' ? 'Solutions complètes d\'analyse et de surveillance environnementale pour un air plus pur' :
             language === 'en' ? 'Complete analysis and environmental monitoring solutions for cleaner air' :
             'حلول شاملة للتحليل والمراقبة البيئية لهواء أنظف'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => (
            <Card key={index} className="p-6 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${service.bgColor}`}>
                  <service.icon className={`h-6 w-6 ${service.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Process Flow */}
        <div className="bg-gradient-hero rounded-2xl p-8 lg:p-12">
          <h3 className="text-2xl font-bold text-center text-foreground mb-8">
            {t.processTitle}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: t.step1, desc: t.step1Desc },
              { step: '02', title: t.step2, desc: t.step2Desc },
              { step: '03', title: t.step3, desc: t.step3Desc },
              { step: '04', title: t.step4, desc: t.step4Desc }
            ].map((process, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {process.step}
                </div>
                <h4 className="font-semibold text-foreground mb-2">{process.title}</h4>
                <p className="text-sm text-muted-foreground">{process.desc}</p>
                
                {index < 3 && (
                  <ArrowRight className="hidden md:block absolute top-6 -right-3 h-6 w-6 text-primary" />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
              {t.startStudyBtn}
              <ArrowRight className={`h-5 w-5 ${language === 'ar' ? 'mr-2 rtl-flip' : 'ml-2'}`} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}