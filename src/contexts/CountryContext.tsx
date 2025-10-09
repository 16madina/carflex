import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Country {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  exchangeRate: number; // Rate to XOF (base currency)
}

export const WEST_AFRICAN_COUNTRIES: Country[] = [
  {
    code: 'SN',
    name: 'Sénégal',
    flag: '🇸🇳',
    currency: 'XOF',
    currencySymbol: 'CFA',
    exchangeRate: 1
  },
  {
    code: 'CI',
    name: "Côte d'Ivoire",
    flag: '🇨🇮',
    currency: 'XOF',
    currencySymbol: 'CFA',
    exchangeRate: 1
  },
  {
    code: 'BJ',
    name: 'Bénin',
    flag: '🇧🇯',
    currency: 'XOF',
    currencySymbol: 'CFA',
    exchangeRate: 1
  },
  {
    code: 'BF',
    name: 'Burkina Faso',
    flag: '🇧🇫',
    currency: 'XOF',
    currencySymbol: 'CFA',
    exchangeRate: 1
  },
  {
    code: 'ML',
    name: 'Mali',
    flag: '🇲🇱',
    currency: 'XOF',
    currencySymbol: 'CFA',
    exchangeRate: 1
  },
  {
    code: 'NE',
    name: 'Niger',
    flag: '🇳🇪',
    currency: 'XOF',
    currencySymbol: 'CFA',
    exchangeRate: 1
  },
  {
    code: 'TG',
    name: 'Togo',
    flag: '🇹🇬',
    currency: 'XOF',
    currencySymbol: 'CFA',
    exchangeRate: 1
  },
  {
    code: 'GW',
    name: 'Guinée-Bissau',
    flag: '🇬🇼',
    currency: 'XOF',
    currencySymbol: 'CFA',
    exchangeRate: 1
  },
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    currency: 'NGN',
    currencySymbol: '₦',
    exchangeRate: 1.2 // Exemple: 1 XOF = 1.2 NGN
  },
  {
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    currency: 'GHS',
    currencySymbol: '₵',
    exchangeRate: 0.07 // Exemple: 1 XOF = 0.07 GHS
  },
  {
    code: 'GN',
    name: 'Guinée',
    flag: '🇬🇳',
    currency: 'GNF',
    currencySymbol: 'FG',
    exchangeRate: 14 // Exemple: 1 XOF = 14 GNF
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
    const saved = localStorage.getItem('selectedCountry');
    if (saved) {
      return JSON.parse(saved);
    }
    return WEST_AFRICAN_COUNTRIES[0]; // Default: Sénégal
  });

  useEffect(() => {
    localStorage.setItem('selectedCountry', JSON.stringify(selectedCountry));
  }, [selectedCountry]);

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
    return `${convertedPrice.toLocaleString('fr-FR', { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    })} ${selectedCountry.currencySymbol}`;
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
