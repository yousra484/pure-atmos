import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Wind, 
  Droplet, 
  Factory,
  TreePine,
  Building2,
  User
} from 'lucide-react';
import { translations } from '@/utils/translations';
import { useAppContext } from '@/context/AppContext';

export default function Countries() {
  const { language, country } = useAppContext();
  const t = translations[language as keyof typeof translations];

  const countries = [
    {
      id: 'dz',
      name: t.algeria,
      flag: '🇩🇿',
      office: t.algeriaOffice,
      phone: '+213 559 34 54 40',
      email: 'pureatmos@gmail.com',
      address: t.algeriaAddress,
      activities: [
        t.airQualityMonitoring,
        t.industrialPollutionStudies,
        t.environmentalConsulting,
        t.awarenessPrograms
      ],
      pollutionTypes: [
        { icon: Wind, name: t.airPollution, desc: t.airPollutionDesc },
        { icon: Droplet, name: t.waterPollution, desc: t.waterPollutionDesc },
        { icon: Factory, name: t.industrialPollution, desc: t.industrialPollutionDesc }
      ],
      team: [
        { name: 'Dr. Ahmed Benali', role: t.environmentalEngineer, speciality: t.airQualitySpecialist },
        { name: 'Fatima Khelil', role: t.fieldTechnician, speciality: t.samplingExpert },
        { name: 'Mohamed Chiheb', role: t.labAnalyst, speciality: t.chemicalAnalysis }
      ]
    },
    {
      id: 'ke',
      name: t.kenya,
      flag: '🇰🇪',
      office: t.kenyaOffice,
      phone: '+254 700 000 000',
      email: 'kenya@pureatmos.com',
      address: t.kenyaAddress,
      activities: [
        t.airQualityMonitoring,
        t.waterQualityAssessment,
        t.soilContaminationStudies,
        t.communityAwareness
      ],
      pollutionTypes: [
        { icon: Wind, name: t.airPollution, desc: t.airPollutionDesc },
        { icon: Droplet, name: t.waterPollution, desc: t.waterPollutionDesc },
        { icon: TreePine, name: t.soilPollution, desc: t.soilPollutionDesc }
      ],
      team: [
        { name: 'Dr. Grace Wanjiku', role: t.environmentalScientist, speciality: t.ecosystemAnalysis },
        { name: 'John Kamau', role: t.fieldCoordinator, speciality: t.communityOutreach },
        { name: 'Mary Achieng', role: t.dataAnalyst, speciality: t.environmentalData }
      ]
    },
    {
      id: 'tz',
      name: t.tanzania,
      flag: '🇹🇿',
      office: t.tanzaniaOffice,
      phone: '+255 700 000 000',
      email: 'tanzania@pureatmos.com',
      address: t.tanzaniaAddress,
      activities: [
        t.coastalPollutionStudies,
        t.miningImpactAssessment,
        t.urbanAirQuality,
        t.environmentalEducation
      ],
      pollutionTypes: [
        { icon: Wind, name: t.airPollution, desc: t.airPollutionDesc },
        { icon: Droplet, name: t.marinePollution, desc: t.marinePollutionDesc },
        { icon: Building2, name: t.urbanPollution, desc: t.urbanPollutionDesc }
      ],
      team: [
        { name: 'Dr. Hassan Mwalimu', role: t.marineEcologist, speciality: t.coastalStudies },
        { name: 'Amina Juma', role: t.environmentalOfficer, speciality: t.policyDevelopment },
        { name: 'Peter Mwangi', role: t.technicalSpecialist, speciality: t.equipmentMaintenance }
      ]
    }
  ];

  const { setCountry, setLanguage } = useAppContext();

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry as any);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as any);
  };

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header />

      <main className="py-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {t.ourPresence}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t.presenceDescription}
            </p>
          </div>
        </section>

        {/* Countries Tabs */}
        <section className="container mx-auto px-4">
          <Tabs defaultValue="dz" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              {countries.map((countryData) => (
                <TabsTrigger key={countryData.id} value={countryData.id} className="gap-2">
                  <span className="text-lg">{countryData.flag}</span>
                  {countryData.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {countries.map((countryData) => (
              <TabsContent key={countryData.id} value={countryData.id}>
                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                  {/* Country Info */}
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-3xl">{countryData.flag}</span>
                      <h2 className="text-2xl font-bold">{countryData.name}</h2>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-primary">{t.officeCoordinates}</h3>
                      
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium">{countryData.office}</p>
                          <p className="text-sm text-muted-foreground">{countryData.address}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <p>{countryData.phone}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <p>{countryData.email}</p>
                      </div>

                      <Button className="w-full mt-4">
                        {t.contactLocalOffice}
                      </Button>
                    </div>
                  </Card>

                  {/* Local Activities */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-primary mb-4">{t.localActivities}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {countryData.activities.map((activity, index) => (
                        <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm text-center">
                          {activity}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Pollution Types */}
                <div className="mb-12">
                  <h3 className="text-2xl font-bold text-center mb-8">{t.pollutionTypesHandled}</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {countryData.pollutionTypes.map((pollution, index) => (
                      <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                        <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                          <pollution.icon className="h-8 w-8 text-primary" />
                        </div>
                        <h4 className="text-lg font-semibold mb-2">{pollution.name}</h4>
                        <p className="text-muted-foreground text-sm">{pollution.desc}</p>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Intervention Team */}
                <div>
                  <h3 className="text-2xl font-bold text-center mb-8">{t.interventionTeam}</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {countryData.team.map((member, index) => (
                      <Card key={index} className="p-6 text-center">
                        <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                          <User className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="text-lg font-semibold mb-1">{member.name}</h4>
                        <p className="text-primary text-sm font-medium mb-2">{member.role}</p>
                        <p className="text-muted-foreground text-sm">{member.speciality}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Awareness Content */}
        <section className="bg-muted/50 py-16 mt-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {t.awarenessContent}
              </h2>
              <p className="text-lg text-muted-foreground">
                {t.awarenessContentDesc}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6">
                <Wind className="h-12 w-12 text-atmos-blue mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t.airPollutionAwareness}</h3>
                <p className="text-muted-foreground text-sm">{t.airPollutionAwarenessDesc}</p>
              </Card>

              <Card className="p-6">
                <Droplet className="h-12 w-12 text-atmos-green mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t.waterProtectionAwareness}</h3>
                <p className="text-muted-foreground text-sm">{t.waterProtectionAwarenessDesc}</p>
              </Card>

              <Card className="p-6">
                <TreePine className="h-12 w-12 text-accent mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t.environmentProtectionAwareness}</h3>
                <p className="text-muted-foreground text-sm">{t.environmentProtectionAwarenessDesc}</p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}