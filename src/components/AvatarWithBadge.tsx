import { ReactNode, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import ProBadge from "./ProBadge";
import { cn } from "@/lib/utils";

interface AvatarWithBadgeProps {
  src?: string | null;
  alt?: string;
  fallback: ReactNode;
  className?: string;
  userId?: string;
}

const AvatarWithBadge = ({ src, alt, fallback, className, userId }: AvatarWithBadgeProps) => {
  const { subscribed, productId, loading: contextLoading } = useSubscription();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [targetUserSubscribed, setTargetUserSubscribed] = useState(false);
  const [loadingTargetUser, setLoadingTargetUser] = useState(false);
  
  // Récupérer l'utilisateur connecté
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user?.id || null);
    });
  }, []);

  // Si userId est fourni et différent de l'utilisateur connecté, vérifier son abonnement
  useEffect(() => {
    const checkUserSubscription = async () => {
      if (!userId || userId === currentUser) return;

      setLoadingTargetUser(true);
      try {
        const { data } = await supabase
          .from('user_subscriptions')
          .select('product_id, status, current_period_end')
          .eq('user_id', userId)
          .eq('status', 'active')
          .gte('current_period_end', new Date().toISOString())
          .maybeSingle();

        setTargetUserSubscribed(!!data && data.product_id !== 'free');
      } catch (error) {
        console.error('Error checking user subscription:', error);
        setTargetUserSubscribed(false);
      } finally {
        setLoadingTargetUser(false);
      }
    };

    checkUserSubscription();
  }, [userId, currentUser]);

  // Badge PRO désactivé temporairement - app gratuite
  const showProBadge = false;

  return (
    <div className="relative inline-block">
      <Avatar className={cn("h-10 w-10", className)}>
        <AvatarImage src={src || undefined} alt={alt} className="object-cover" />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {fallback}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default AvatarWithBadge;
