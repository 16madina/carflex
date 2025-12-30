import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface ListingLimitIndicatorProps {
  listingsThisMonth: number;
  freeListingsLimit: number;
  loading?: boolean;
}

export const ListingLimitIndicator = ({
  listingsThisMonth,
  freeListingsLimit,
  loading = false,
}: ListingLimitIndicatorProps) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-2 w-full" />
      </div>
    );
  }

  const remaining = Math.max(0, freeListingsLimit - listingsThisMonth);
  const percentage = (listingsThisMonth / freeListingsLimit) * 100;
  const isAtLimit = listingsThisMonth >= freeListingsLimit;
  const isNearLimit = listingsThisMonth >= freeListingsLimit - 1 && !isAtLimit;

  // Determine the alert variant and styling
  const getAlertStyles = () => {
    if (isAtLimit) {
      return {
        variant: "destructive" as const,
        icon: AlertCircle,
        title: "Limite atteinte",
        description: `Vous avez utilisé toutes vos ${freeListingsLimit} annonces gratuites ce mois-ci.`,
        progressColor: "bg-destructive",
      };
    }
    if (isNearLimit) {
      return {
        variant: "default" as const,
        icon: AlertTriangle,
        title: "Limite proche",
        description: `Il vous reste ${remaining} annonce${remaining > 1 ? "s" : ""} gratuite${remaining > 1 ? "s" : ""} ce mois-ci.`,
        progressColor: "bg-amber-500",
      };
    }
    return {
      variant: "default" as const,
      icon: CheckCircle2,
      title: "Annonces disponibles",
      description: `Il vous reste ${remaining} annonce${remaining > 1 ? "s" : ""} gratuite${remaining > 1 ? "s" : ""} ce mois-ci.`,
      progressColor: "bg-primary",
    };
  };

  const styles = getAlertStyles();
  const Icon = styles.icon;

  return (
    <Alert variant={styles.variant} className={isNearLimit ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20" : ""}>
      <Icon className={`h-4 w-4 ${isNearLimit ? "text-amber-600" : ""}`} />
      <AlertTitle className={isNearLimit ? "text-amber-800 dark:text-amber-200" : ""}>
        {styles.title}
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p className={isNearLimit ? "text-amber-700 dark:text-amber-300" : ""}>
          {styles.description}
        </p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>{listingsThisMonth}/{freeListingsLimit} annonces utilisées</span>
            <span>{remaining} restante{remaining > 1 ? "s" : ""}</span>
          </div>
          <Progress 
            value={Math.min(percentage, 100)} 
            className="h-2"
          />
        </div>
      </AlertDescription>
    </Alert>
  );
};
