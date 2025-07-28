import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Users, Building } from 'lucide-react';
import { translations } from '@/utils/translations';

interface CountriesSectionProps {
  language: string;
  selectedCountry: string;
  onCountrySelect: (country: string) => void;
}

export function CountriesSection({ language, selectedCountry, onCountrySelect }: CountriesSectionProps) {
  const t = translations[language as keyof typeof translations];

  const countries = [
    {
      code: 'dz',
      name: t.algeria,
      flag: '🇩🇿',
      office: 'Université de Tlemcen, Abou Bekr Belkaid',
      department: 'Département de Biologie',
      phone: '+213 559 34 54 40',
      email: 'pureatmos@gmail.com',
      team: [
        { name: 'Dr. Amina Benali', role: 'Directrice Scientifique', avatar: '👩‍🔬' },
        { name: 'Mohamed Cherif', role: 'Ingénieur Terrain', avatar: '👨‍💼' },
        { name: 'Fatima Zahra', role: 'Analyste Laboratoire', avatar: '👩‍🔬' }
      ],
      services: ['Pollution urbaine', 'Analyses industrielles', 'Air intérieur'],
      gradient: 'from-green-500 to-red-500'
    },
    {
      code: 'tz',
      name: t.tanzania,
      flag: '🇹🇿',
      office: 'Dar es Salaam Office',
      department: 'Environmental Research Center',
      phone: '+255 XX XXX XXXX',
      email: 'tanzania@pureatmos.com',
      team: [
        { name: 'Dr. John Mwalimu', role: 'Country Director', avatar: '👨‍🔬' },
        { name: 'Grace Kilimo', role: 'Field Coordinator', avatar: '👩‍💼' },
        { name: 'Peter Msangi', role: 'Lab Technician', avatar: '👨‍🔬' }
      ],
      services: ['Rural monitoring', 'Mining impact', 'Coastal air quality'],
      gradient: 'from-blue-500 to-green-500'
    },
    {
      code: 'ke',
      name: t.kenya,
      flag: '🇰🇪',
      office: 'Nairobi Research Hub',
      department: 'Air Quality Division',
      phone: '+254 XXX XXX XXX',
      email: 'kenya@pureatmos.com',
      team: [
        { name: 'Dr. Sarah Wanjiku', role: 'Regional Manager', avatar: '👩‍🔬' },
        { name: 'James Kiprotich', role: 'Data Analyst', avatar: '👨‍💻' },
        { name: 'Mary Achieng', role: 'Community Liaison', avatar: '👩‍💼' }
      ],
      services: ['Urban pollution', 'Agricultural impact', 'Industrial monitoring'],
      gradient: 'from-red-500 to-black'
    }
  ];

  const currentCountry = countries.find(c => c.code === selectedCountry) || countries[0];

  return (
    <section id="countries" className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {t.officesInAfrica}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.officesDesc}
          </p>
        </div>

        {/* Country Selector */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-card rounded-lg p-1 shadow-soft">
            {countries.map((country) => (
              <Button
                key={country.code}
                variant={selectedCountry === country.code ? "default" : "ghost"}
                onClick={() => onCountrySelect(country.code)}
                className="gap-2"
              >
                <span className="text-lg">{country.flag}</span>
                {country.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Selected Country Details */}
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 shadow-card">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Office Information */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-4xl">{currentCountry.flag}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{currentCountry.name}</h3>
                    <p className="text-muted-foreground">{currentCountry.department}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium text-foreground">{currentCountry.office}</p>
                      <p className="text-sm text-muted-foreground">{currentCountry.department}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <p className="text-foreground">{currentCountry.phone}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <p className="text-foreground">{currentCountry.email}</p>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">{t.specializedServices}</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentCountry.services.map((service, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-accent/10 text-accent-foreground rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team */}
              <div>
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t.localTeam}
                </h4>
                
                <div className="space-y-3">
                  {currentCountry.team.map((member, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                      <span className="text-2xl">{member.avatar}</span>
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
                    <MapPin className={`h-4 w-4 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
                    {t.contactOffice} {currentCountry.name}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Coverage Map Placeholder */}
        <div className="mt-12 text-center">
          <Card className="p-8 bg-gradient-to-r from-atmos-blue/5 to-atmos-green/5">
            <h4 className="text-xl font-semibold text-foreground mb-4">
              {t.geographicCoverage}
            </h4>
            <p className="text-muted-foreground mb-6">
              {t.geographicDesc}
            </p>
            <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">{t.interactiveMap}</p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}