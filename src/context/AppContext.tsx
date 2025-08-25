import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'en' | 'ar';
type Country = 'dz' | 'ma' | 'tn' | 'other';

interface AppContextType {
  language: Language;
  country: Country;
  setLanguage: (lang: Language) => void;
  setCountry: (country: Country) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Récupérer les préférences stockées ou utiliser les valeurs par défaut
  const [language, setLanguage] = useState<Language>('fr');
  const [country, setCountry] = useState<Country>('dz');

  return (
    <AppContext.Provider value={{ language, country, setLanguage, setCountry }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
