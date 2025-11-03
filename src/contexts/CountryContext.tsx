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
  // Pays UEMOA (Afrique francophone avec CFA)
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
    code: 'SN',
    name: 'Sénégal',
    flag: '🇸🇳',
    currency: 'XOF',
    currencySymbol: 'CFA',
    exchangeRate: 1,
    dialCode: '+221'
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
  // Autres pays africains francophones
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
    code: 'CM',
    name: 'Cameroun',
    flag: '🇨🇲',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    exchangeRate: 1,
    dialCode: '+237'
  },
  {
    code: 'CD',
    name: 'RD Congo',
    flag: '🇨🇩',
    currency: 'CDF',
    currencySymbol: 'FC',
    exchangeRate: 3.5,
    dialCode: '+243'
  },
  {
    code: 'CG',
    name: 'Congo',
    flag: '🇨🇬',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    exchangeRate: 1,
    dialCode: '+242'
  },
  {
    code: 'GA',
    name: 'Gabon',
    flag: '🇬🇦',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    exchangeRate: 1,
    dialCode: '+241'
  },
  {
    code: 'TD',
    name: 'Tchad',
    flag: '🇹🇩',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    exchangeRate: 1,
    dialCode: '+235'
  },
  {
    code: 'CF',
    name: 'Centrafrique',
    flag: '🇨🇫',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    exchangeRate: 1,
    dialCode: '+236'
  },
  {
    code: 'MG',
    name: 'Madagascar',
    flag: '🇲🇬',
    currency: 'MGA',
    currencySymbol: 'Ar',
    exchangeRate: 5.5,
    dialCode: '+261'
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
    code: 'DZ',
    name: 'Algérie',
    flag: '🇩🇿',
    currency: 'DZD',
    currencySymbol: 'DA',
    exchangeRate: 0.13,
    dialCode: '+213'
  },
  {
    code: 'TN',
    name: 'Tunisie',
    flag: '🇹🇳',
    currency: 'TND',
    currencySymbol: 'DT',
    exchangeRate: 0.0033,
    dialCode: '+216'
  },
  // Autres pays africains
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
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    currency: 'KES',
    currencySymbol: 'KSh',
    exchangeRate: 0.18,
    dialCode: '+254'
  },
  {
    code: 'ZA',
    name: 'Afrique du Sud',
    flag: '🇿🇦',
    currency: 'ZAR',
    currencySymbol: 'R',
    exchangeRate: 0.033,
    dialCode: '+27'
  },
  {
    code: 'ET',
    name: 'Éthiopie',
    flag: '🇪🇹',
    currency: 'ETB',
    currencySymbol: 'Br',
    exchangeRate: 0.08,
    dialCode: '+251'
  },
  {
    code: 'EG',
    name: 'Égypte',
    flag: '🇪🇬',
    currency: 'EGP',
    currencySymbol: 'E£',
    exchangeRate: 0.035,
    dialCode: '+20'
  },
  // Europe francophone
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
    code: 'LU',
    name: 'Luxembourg',
    flag: '🇱🇺',
    currency: 'EUR',
    currencySymbol: '€',
    exchangeRate: 0.0015,
    dialCode: '+352'
  },
  // Autres pays européens
  {
    code: 'DE',
    name: 'Allemagne',
    flag: '🇩🇪',
    currency: 'EUR',
    currencySymbol: '€',
    exchangeRate: 0.0015,
    dialCode: '+49'
  },
  {
    code: 'GB',
    name: 'Royaume-Uni',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£',
    exchangeRate: 0.0013,
    dialCode: '+44'
  },
  {
    code: 'IT',
    name: 'Italie',
    flag: '🇮🇹',
    currency: 'EUR',
    currencySymbol: '€',
    exchangeRate: 0.0015,
    dialCode: '+39'
  },
  {
    code: 'ES',
    name: 'Espagne',
    flag: '🇪🇸',
    currency: 'EUR',
    currencySymbol: '€',
    exchangeRate: 0.0015,
    dialCode: '+34'
  },
  {
    code: 'NL',
    name: 'Pays-Bas',
    flag: '🇳🇱',
    currency: 'EUR',
    currencySymbol: '€',
    exchangeRate: 0.0015,
    dialCode: '+31'
  },
  {
    code: 'PT',
    name: 'Portugal',
    flag: '🇵🇹',
    currency: 'EUR',
    currencySymbol: '€',
    exchangeRate: 0.0015,
    dialCode: '+351'
  },
  // Amérique
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    currencySymbol: '$',
    exchangeRate: 0.0021,
    dialCode: '+1'
  },
  {
    code: 'US',
    name: 'États-Unis',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$',
    exchangeRate: 0.0017,
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
