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
  // ========== AFRIQUE - Tous les pays africains en premier ==========
  
  // Afrique de l'Ouest - UEMOA (CFA XOF)
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
  
  // Afrique de l'Ouest - Autres
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
    code: 'SL',
    name: 'Sierra Leone',
    flag: '🇸🇱',
    currency: 'SLL',
    currencySymbol: 'Le',
    exchangeRate: 25,
    dialCode: '+232'
  },
  {
    code: 'LR',
    name: 'Liberia',
    flag: '🇱🇷',
    currency: 'LRD',
    currencySymbol: '$',
    exchangeRate: 0.3,
    dialCode: '+231'
  },
  {
    code: 'GM',
    name: 'Gambie',
    flag: '🇬🇲',
    currency: 'GMD',
    currencySymbol: 'D',
    exchangeRate: 0.09,
    dialCode: '+220'
  },
  {
    code: 'CV',
    name: 'Cap-Vert',
    flag: '🇨🇻',
    currency: 'CVE',
    currencySymbol: '$',
    exchangeRate: 0.17,
    dialCode: '+238'
  },
  {
    code: 'MR',
    name: 'Mauritanie',
    flag: '🇲🇷',
    currency: 'MRU',
    currencySymbol: 'UM',
    exchangeRate: 0.06,
    dialCode: '+222'
  },
  
  // Afrique Centrale - CEMAC (CFA XAF)
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
    code: 'GQ',
    name: 'Guinée équatoriale',
    flag: '🇬🇶',
    currency: 'XAF',
    currencySymbol: 'FCFA',
    exchangeRate: 1,
    dialCode: '+240'
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
    code: 'AO',
    name: 'Angola',
    flag: '🇦🇴',
    currency: 'AOA',
    currencySymbol: 'Kz',
    exchangeRate: 1.4,
    dialCode: '+244'
  },
  {
    code: 'ST',
    name: 'São Tomé-et-Príncipe',
    flag: '🇸🇹',
    currency: 'STN',
    currencySymbol: 'Db',
    exchangeRate: 0.04,
    dialCode: '+239'
  },
  
  // Afrique de l'Est
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
    code: 'ET',
    name: 'Éthiopie',
    flag: '🇪🇹',
    currency: 'ETB',
    currencySymbol: 'Br',
    exchangeRate: 0.08,
    dialCode: '+251'
  },
  {
    code: 'TZ',
    name: 'Tanzanie',
    flag: '🇹🇿',
    currency: 'TZS',
    currencySymbol: 'TSh',
    exchangeRate: 4,
    dialCode: '+255'
  },
  {
    code: 'UG',
    name: 'Ouganda',
    flag: '🇺🇬',
    currency: 'UGX',
    currencySymbol: 'USh',
    exchangeRate: 6,
    dialCode: '+256'
  },
  {
    code: 'RW',
    name: 'Rwanda',
    flag: '🇷🇼',
    currency: 'RWF',
    currencySymbol: 'FRw',
    exchangeRate: 1.8,
    dialCode: '+250'
  },
  {
    code: 'BI',
    name: 'Burundi',
    flag: '🇧🇮',
    currency: 'BIF',
    currencySymbol: 'FBu',
    exchangeRate: 4.5,
    dialCode: '+257'
  },
  {
    code: 'SS',
    name: 'Soudan du Sud',
    flag: '🇸🇸',
    currency: 'SSP',
    currencySymbol: '£',
    exchangeRate: 2,
    dialCode: '+211'
  },
  {
    code: 'SD',
    name: 'Soudan',
    flag: '🇸🇩',
    currency: 'SDG',
    currencySymbol: '£',
    exchangeRate: 0.9,
    dialCode: '+249'
  },
  {
    code: 'ER',
    name: 'Érythrée',
    flag: '🇪🇷',
    currency: 'ERN',
    currencySymbol: 'Nkf',
    exchangeRate: 0.025,
    dialCode: '+291'
  },
  {
    code: 'DJ',
    name: 'Djibouti',
    flag: '🇩🇯',
    currency: 'DJF',
    currencySymbol: 'Fdj',
    exchangeRate: 0.3,
    dialCode: '+253'
  },
  {
    code: 'SO',
    name: 'Somalie',
    flag: '🇸🇴',
    currency: 'SOS',
    currencySymbol: 'Sh',
    exchangeRate: 0.95,
    dialCode: '+252'
  },
  
  // Afrique Australe
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
    code: 'MZ',
    name: 'Mozambique',
    flag: '🇲🇿',
    currency: 'MZN',
    currencySymbol: 'MT',
    exchangeRate: 0.1,
    dialCode: '+258'
  },
  {
    code: 'ZW',
    name: 'Zimbabwe',
    flag: '🇿🇼',
    currency: 'ZWL',
    currencySymbol: '$',
    exchangeRate: 0.5,
    dialCode: '+263'
  },
  {
    code: 'ZM',
    name: 'Zambie',
    flag: '🇿🇲',
    currency: 'ZMW',
    currencySymbol: 'ZK',
    exchangeRate: 0.04,
    dialCode: '+260'
  },
  {
    code: 'MW',
    name: 'Malawi',
    flag: '🇲🇼',
    currency: 'MWK',
    currencySymbol: 'MK',
    exchangeRate: 2.8,
    dialCode: '+265'
  },
  {
    code: 'BW',
    name: 'Botswana',
    flag: '🇧🇼',
    currency: 'BWP',
    currencySymbol: 'P',
    exchangeRate: 0.022,
    dialCode: '+267'
  },
  {
    code: 'NA',
    name: 'Namibie',
    flag: '🇳🇦',
    currency: 'NAD',
    currencySymbol: '$',
    exchangeRate: 0.033,
    dialCode: '+264'
  },
  {
    code: 'SZ',
    name: 'Eswatini',
    flag: '🇸🇿',
    currency: 'SZL',
    currencySymbol: 'L',
    exchangeRate: 0.033,
    dialCode: '+268'
  },
  {
    code: 'LS',
    name: 'Lesotho',
    flag: '🇱🇸',
    currency: 'LSL',
    currencySymbol: 'L',
    exchangeRate: 0.033,
    dialCode: '+266'
  },
  
  // Océan Indien
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
    code: 'MU',
    name: 'Maurice',
    flag: '🇲🇺',
    currency: 'MUR',
    currencySymbol: '₨',
    exchangeRate: 0.07,
    dialCode: '+230'
  },
  {
    code: 'SC',
    name: 'Seychelles',
    flag: '🇸🇨',
    currency: 'SCR',
    currencySymbol: '₨',
    exchangeRate: 0.02,
    dialCode: '+248'
  },
  {
    code: 'KM',
    name: 'Comores',
    flag: '🇰🇲',
    currency: 'KMF',
    currencySymbol: 'CF',
    exchangeRate: 0.75,
    dialCode: '+269'
  },
  
  // Afrique du Nord
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
  {
    code: 'LY',
    name: 'Libye',
    flag: '🇱🇾',
    currency: 'LYD',
    currencySymbol: 'LD',
    exchangeRate: 0.008,
    dialCode: '+218'
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
  
  // ========== EUROPE ==========
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
  
  // ========== AMÉRIQUE ==========
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

// Valeur par défaut pour éviter les erreurs de timing
const defaultCountry = {
  code: 'CI',
  name: "Côte d'Ivoire",
  flag: '🇨🇮',
  currency: 'XOF',
  currencySymbol: 'CFA',
  exchangeRate: 1,
  dialCode: '+225'
};

const CountryContext = createContext<CountryContextType>({
  selectedCountry: defaultCountry,
  setSelectedCountry: () => {},
  formatPrice: (price: number) => `${price} CFA`,
  convertPrice: (price: number) => price,
});

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    // Ne pas utiliser localStorage pour le pays par défaut
    // Toujours commencer avec la Côte d'Ivoire
    return WEST_AFRICAN_COUNTRIES[0]; // Default: Côte d'Ivoire
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
  return context;
};
