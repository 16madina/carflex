import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Subscription {
  id: string;
  user_id: string;
  current_period_end: string;
  product_id: string;
  status: string;
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[Expiring Subscriptions] Checking for subscriptions expiring in 3 days...');

    // Calculer la date dans 3 jours (début et fin de journée)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    threeDaysFromNow.setHours(0, 0, 0, 0);
    
    const threeDaysFromNowEnd = new Date(threeDaysFromNow);
    threeDaysFromNowEnd.setHours(23, 59, 59, 999);

    console.log('[Expiring Subscriptions] Date range:', {
      start: threeDaysFromNow.toISOString(),
      end: threeDaysFromNowEnd.toISOString()
    });

    // Récupérer les abonnements actifs expirant dans 3 jours
    const { data: expiringSubscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('id, user_id, current_period_end, product_id, status')
      .eq('status', 'active')
      .gte('current_period_end', threeDaysFromNow.toISOString())
      .lte('current_period_end', threeDaysFromNowEnd.toISOString());

    if (subError) {
      console.error('[Expiring Subscriptions] Error fetching subscriptions:', subError);
      throw subError;
    }

    if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
      console.log('[Expiring Subscriptions] No subscriptions expiring in 3 days');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No expiring subscriptions found',
          count: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log(`[Expiring Subscriptions] Found ${expiringSubscriptions.length} subscriptions expiring in 3 days`);

    let notificationsSent = 0;
    let errors = 0;

    // Pour chaque abonnement expirant, créer une notification
    for (const subscription of expiringSubscriptions as Subscription[]) {
      try {
        const expirationDate = new Date(subscription.current_period_end);
        const formattedDate = expirationDate.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        // Vérifier si une notification similaire n'a pas déjà été créée aujourd'hui
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: existingNotifications } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', subscription.user_id)
          .eq('type', 'subscription_expiring')
          .gte('created_at', today.toISOString())
          .limit(1);

        if (existingNotifications && existingNotifications.length > 0) {
          console.log(`[Expiring Subscriptions] Notification already sent today for user ${subscription.user_id}`);
          continue;
        }

        // Créer la notification dans la base de données
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: subscription.user_id,
            type: 'subscription_expiring',
            title: 'Votre abonnement arrive à expiration',
            message: `Votre abonnement Pro expire le ${formattedDate}. Renouvelez-le pour continuer à profiter de tous les avantages premium !`,
            read: false
          });

        if (notifError) {
          console.error(`[Expiring Subscriptions] Error creating notification for user ${subscription.user_id}:`, notifError);
          errors++;
          continue;
        }

        console.log(`[Expiring Subscriptions] Notification created for user ${subscription.user_id}`);
        notificationsSent++;

        // Récupérer les informations de l'utilisateur pour les push tokens
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .eq('id', subscription.user_id)
          .single();

        if (profile) {
          // Note: Les push tokens sont gérés côté client avec Capacitor Push Notifications
          // Ici, on crée juste la notification en base de données
          // Le client récupérera les nouvelles notifications et pourra afficher une notification locale
          console.log(`[Expiring Subscriptions] Profile found for ${profile.email}`);
        }

      } catch (error) {
        console.error(`[Expiring Subscriptions] Error processing subscription ${subscription.id}:`, error);
        errors++;
      }
    }

    console.log(`[Expiring Subscriptions] Summary: ${notificationsSent} notifications sent, ${errors} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${expiringSubscriptions.length} expiring subscriptions`,
        notificationsSent,
        errors
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('[Expiring Subscriptions] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
