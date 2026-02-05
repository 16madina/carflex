import * as Flags from 'country-flag-icons/react/3x2';
import { cn } from '@/lib/utils';

interface FlagIconProps {
  countryCode: string;
  className?: string;
}

const FlagIcon = ({ countryCode, className }: FlagIconProps) => {
  // Récupérer le composant de drapeau correspondant au code pays
  const FlagComponent = Flags[countryCode as keyof typeof Flags];
  
  if (!FlagComponent || typeof FlagComponent !== 'function') {
    // Fallback: afficher le code pays si le drapeau n'existe pas
    return (
      <span className={cn("inline-flex items-center justify-center bg-muted rounded text-xs font-medium", className)}>
        {countryCode}
      </span>
    );
  }
  
  return <FlagComponent className={cn("rounded-sm", className)} />;
};

export default FlagIcon;
