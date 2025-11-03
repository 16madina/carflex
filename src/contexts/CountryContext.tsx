import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Country {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  exchangeRate: number; // Rate to XOF (base currency)
  dialCode: string;
}

export const WEST_AFRICAN_COUNTRIES: Country[] = [
  {
    code: 'SN',
    name: 'Sénégal',
    flag: '🇸🇳',
    currency: 'XOF',
    currencySymbol: 'CFA',
    exchangeRate: 1,
    dialCode: '+221'
  },
  {
    code: 'CI',
    name: "Côte d'Ivoire",
    flag: '🇨🇮',
    currency: 'XOF',
    currencySymbol: 'CFA',
    exchangeRate: 1,
    dialCode: '+225'
  },
  {
    code: 'BJ',
    name: 'Bénin',
    flag: '🇧🇯',
    currency: 'XOF',
    currencySymbol: 'CFA',
    exchangeRate: 1,
    dialCode: '+229'
  },
  {
    code: 'BF',
    name: 'Burkina Faso',
    flag: '🇧🇫',
    currency: 'XOF',
    currencySymbol: 'CFA',
    exchangeRate: 1,
    dialCode: '+226'
  },
  {
    code: 'ML',
    name: 'Mali',
    flag: '🇲🇱',
    currency: 'XOF',
    currencySymbol: 'CFA',
    exchangeRate: 1,
    dialCode: '+223'
  },
  {
    code: 'NE',
    name: 'Niger',
    flag: '🇳🇪',
    currency: 'XOF',
    currencySymbol: 'CFA',
    exchangeRate: 1,
    dialCode: '+227'
  },
  {
    code: 'TG',
    name: 'Togo',
    flag: '🇹🇬',
    currency: 'XOF',
    currencySymbol: 'CFA',
    exchangeRate: 1,
    dialCode: '+228'
  },
  {
    code: 'GW',
    name: 'Guinée-Bissau',
    flag: '🇬🇼',
    currency: 'XOF',
    currencySymbol: 'CFA',
    exchangeRate: 1,
    dialCode: '+245'
  },
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    currency: 'NGN',
    currencySymbol: '₦',
    exchangeRate: 1.2,
    dialCode: '+234'
  },
  {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    currency: 'GHS',
    currencySymbol: '₵',
    exchangeRate: 0.07,
    dialCode: '+233'
  },
  {
    code: 'GN',
    name: 'Guinée',
    flag: '🇬🇳',
    currency: 'GNF',
    currencySymbol: 'FG',
    exchangeRate: 14,
    dialCode: '+224'
  },
  {
    code: 'MA',
    name: 'Maroc',
    flag: '🇲🇦',
    currency: 'MAD',
    currencySymbol: 'DH',
    exchangeRate: 0.055,
    dialCode: '+212'
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    currency: 'EUR',
    currencySymbol: '€',
    exchangeRate: 0.0015,
    dialCode: '+33'
  },
  {
    code: 'BE',
    name: 'Belgique',
    flag: '🇧🇪',
    currency: 'EUR',
    currencySymbol: '€',
    exchangeRate: 0.0015,
    dialCode: '+32'
  },
  {
    code: 'CH',
    name: 'Suisse',
    flag: '🇨🇭',
    currency: 'CHF',
    currencySymbol: 'CHF',
    exchangeRate: 0.0016,
    dialCode: '+41'
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    currencySymbol: '$',
    exchangeRate: 0.0021,
    dialCode: '+1'
  }
];

interface CountryContextType {
  selectedCountry: Country;
  setSelectedCountry: (country: Country) => void;
  formatPrice: (price: number) => string;
  convertPrice: (price: number, fromCurrency?: string) => number;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    // Ne pas utiliser localStorage pour le pays par défaut
    // Toujours commencer avec la Côte d'Ivoire
    return WEST_AFRICAN_COUNTRIES[1]; // Default: Côte d'Ivoire
  });

  // Ne plus sauvegarder automatiquement le pays dans localStorage
  // Le pays sera synchronisé depuis le profil utilisateur via AuthSync

  const convertPrice = (price: number, fromCurrency: string = 'XOF'): number => {
    // Convert from source currency to XOF first
    let priceInXOF = price;
    if (fromCurrency !== 'XOF') {
      const sourceCurrency = WEST_AFRICAN_COUNTRIES.find(c => c.currency === fromCurrency);
      if (sourceCurrency) {
        priceInXOF = price / sourceCurrency.exchangeRate;
      }
    }
    
    // Then convert from XOF to target currency
    return priceInXOF * selectedCountry.exchangeRate;
  };

  const formatPrice = (price: number): string => {
    const convertedPrice = convertPrice(price);
    const symbol = selectedCountry.currencySymbol;
    
    // Pour les millions (>= 1 000 000)
    if (convertedPrice >= 1000000) {
      const millions = convertedPrice / 1000000;
      // Si c'est un nombre rond de millions, pas de décimales
      if (millions % 1 === 0) {
        return `${millions.toLocaleString('fr-FR')} millions ${symbol}`;
      }
      // Sinon, 1 décimale maximum
      return `${millions.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} millions ${symbol}`;
    }
    
    // Pour les milliers (>= 10 000)
    if (convertedPrice >= 10000) {
      const thousands = convertedPrice / 1000;
      return `${Math.round(thousands)}K ${symbol}`;
    }
    
    // Pour les petits montants
    return `${convertedPrice.toLocaleString('fr-FR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    })} ${symbol}`;
  };

  return (
    <CountryContext.Provider value={{ 
      selectedCountry, 
      setSelectedCountry,
      formatPrice,
      convertPrice
    }}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
};
