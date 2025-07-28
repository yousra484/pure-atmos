import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Country {
  code: string;
  name: string;
  flag: string;
}

const countries: Country[] = [
  { code: 'dz', name: 'Algérie', flag: '🇩🇿' },
  { code: 'tz', name: 'Tanzanie', flag: '🇹🇿' },
  { code: 'ke', name: 'Kenya', flag: '🇰🇪' },
];

interface CountrySelectorProps {
  currentCountry: string;
  onCountryChange: (country: string) => void;
  translations: any;
}

export function CountrySelector({ currentCountry, onCountryChange, translations }: CountrySelectorProps) {
  const currentCountryData = countries.find(country => country.code === currentCountry) || countries[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">{currentCountryData.name}</span>
          <span className="sm:hidden">{currentCountryData.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {countries.map((country) => (
          <DropdownMenuItem
            key={country.code}
            onClick={() => onCountryChange(country.code)}
            className={currentCountry === country.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{country.flag}</span>
            {country.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}