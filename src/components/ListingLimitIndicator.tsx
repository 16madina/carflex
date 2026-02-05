import { AlertCircle, AlertTriangle, CheckCircle2, Crown, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SubscriptionTier } from "@/contexts/SubscriptionContext";

interface ListingLimitIndicatorProps {
  listingsThisMonth: number;
  freeListingsLimit: number;
  loading?: boolean;
  isPro?: boolean;
  tier?: SubscriptionTier;
  boostsRemaining?: number;
  boostsLimit?: number;
}

const TIER_LABELS: Record<SubscriptionTier, { label: string; color: string }> = {
  'free': { label: 'Gratuit', color: 'bg-muted' },
  'pro_argent': { label: 'Pro Argent', color: 'bg-slate-400' },
  'pro_gold': { label: 'Pro Gold', color: 'bg-amber-500' },
};

export const ListingLimitIndicator = ({
  listingsThisMonth,
  freeListingsLimit,
  loading = false,
  isPro = false,
  tier = 'free',
  boostsRemaining = 0,
  boostsLimit = 0,
}: ListingLimitIndicatorProps) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-2 w-full" />
      </div>
    );
  }

  // Pro users display
  if (isPro && tier !== 'free') {
    const tierInfo = TIER_LABELS[tier];
    const remaining = Math.max(0, freeListingsLimit - listingsThisMonth);
    const percentage = (listingsThisMonth / freeListingsLimit) * 100;
    
    return (
      <Alert className="border-primary/50 bg-primary/5">
        <Crown className="h-4 w-4 text-primary" />
        <AlertTitle className="flex items-center gap-2">
          {tierInfo.label}
          <Badge variant="default" className={`${tierInfo.color} text-white`}>
            PRO
          </Badge>
        </AlertTitle>
        <AlertDescription className="space-y-3">
          <p className="text-muted-foreground">
            Vous avez {remaining} annonce{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''} ce mois-ci.
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{listingsThisMonth}/{freeListingsLimit} annonces utilisées</span>
              <span>{remaining} restante{remaining > 1 ? 's' : ''}</span>
            </div>
            <Progress 
              value={Math.min(percentage, 100)} 
              className="h-2"
            />
          </div>
          {boostsLimit > 0 && (
            <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-background/50">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-sm">
                <strong>{boostsRemaining}</strong> boost{boostsRemaining > 1 ? 's' : ''} gratuit{boostsRemaining > 1 ? 's' : ''} restant{boostsRemaining > 1 ? 's' : ''} ce mois
              </span>
            </div>
          )}
        </AlertDescription>
      </Alert>
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