import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { create } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// App Store Server API configuration
const APP_STORE_API_PRODUCTION = "https://api.storekit.itunes.apple.com";
const APP_STORE_API_SANDBOX = "https://api.storekit-sandbox.itunes.apple.com";
const BUNDLE_ID = "app.lovable.c69889b6be82430184ff53e58a725869";

// Fonction pour générer un JWT signé pour l'API App Store
async function generateAppStoreToken(): Promise<string> {
  const privateKey = Deno.env.get('APP_STORE_PRIVATE_KEY');
  const keyId = Deno.env.get('APP_STORE_KEY_ID');
  const issuerId = Deno.env.get('APP_STORE_ISSUER_ID');

  if (!privateKey || !keyId || !issuerId) {
    throw new Error('Missing App Store credentials');
  }

  console.log('[JWT] Génération du token App Store...');

  // Nettoyer la clé privée
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = privateKey
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");
  
  // Convertir en format binaire
  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  // Importer la clé
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    false,
    ["sign"]
  );

  // Créer le JWT
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: issuerId,
    iat: now,
    exp: now + 3600, // Expire dans 1 heure
    aud: "appstoreconnect-v1",
    bid: BUNDLE_ID,
  };

  const jwt = await create(
    { alg: "ES256", kid: keyId, typ: "JWT" },
    payload,
    cryptoKey
  );

  console.log('[JWT] Token généré avec succès');
  return jwt;
}

// Fonction pour vérifier une transaction avec l'API App Store
// Implémente la stratégie recommandée par Apple : essayer d'abord la production, puis le sandbox si nécessaire
async function verifyTransaction(transactionId: string): Promise<any> {
  const token = await generateAppStoreToken();
  
  console.log('[App Store API] === VERIFICATION START ===');
  console.log(`[App Store API] Transaction ID: ${transactionId}`);
  
  // ÉTAPE 1: Essayer d'abord avec l'environnement de production
  console.log('[App Store API] Environment: PRODUCTION (attempt 1)');
  let response = await fetch(
    `${APP_STORE_API_PRODUCTION}/inApps/v1/transactions/${transactionId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // ÉTAPE 2: Si erreur indiquant une transaction Sandbox, réessayer avec Sandbox
  if (!response.ok) {
    const statusCode = response.status;
    const errorText = await response.text();
    console.log(`[App Store API] Production response status: ${statusCode}`);
    console.log(`[App Store API] Production error (first 200 chars): ${errorText.substring(0, 200)}`);
    
    // Essayer de parser le JSON pour extraire le code d'erreur exact
    let errorCode: number | null = null;
    try {
      const errorJson = JSON.parse(errorText);
      errorCode = errorJson.errorCode;
      console.log(`[App Store API] Parsed error code: ${errorCode}`);
    } catch (e) {
      // Si ce n'est pas du JSON valide, continuer avec le texte brut
      console.log('[App Store API] Could not parse error as JSON, using text match');
    }
    
    // Détecter si c'est une transaction Sandbox
    // App Store Server API v2 error codes:
    // 4040003 = Transaction id not found
    // 4040004 = Transaction id not found for this app
    // 4040005 = Original transaction id not found
    // Legacy codes: 21007 = This receipt is from the test environment
    const isSandboxTransaction = 
      statusCode === 404 || 
      errorCode === 4040003 || 
      errorCode === 4040004 || 
      errorCode === 4040005 ||
      errorText.includes('21007') ||
      errorText.toLowerCase().includes('sandbox') ||
      errorText.toLowerCase().includes('not found');
    
    if (isSandboxTransaction) {
      console.log('[App Store API] === FALLBACK TO SANDBOX ===');
      console.log('[App Store API] Reason: Transaction not found in production or sandbox receipt detected');
      console.log('[App Store API] Environment: SANDBOX (attempt 2)');
      
      // Réessayer avec l'environnement Sandbox
      response = await fetch(
        `${APP_STORE_API_SANDBOX}/inApps/v1/transactions/${transactionId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        const sandboxError = await response.text();
        console.error('[App Store API] Sandbox error:', sandboxError);
        throw new Error(`App Store API Sandbox error: ${response.status} - ${sandboxError}`);
      }
      
      console.log('[App Store API] ✅ Transaction vérifiée avec succès (Sandbox)');
      console.log('[App Store API] === VERIFICATION END ===');
    } else {
      console.error('[App Store API] Non-sandbox error, cannot fallback');
      console.log('[App Store API] === VERIFICATION FAILED ===');
      throw new Error(`App Store API error: ${statusCode} - ${errorText}`);
    }
  } else {
    console.log('[App Store API] ✅ Transaction vérifiée avec succès (Production)');
    console.log('[App Store API] === VERIFICATION END ===');
  }

  const data = await response.json();
  return data;
}

// Fonction pour décoder le signedTransaction JWT
function decodeSignedTransaction(signedTransaction: string): any {
  const [, payloadBase64] = signedTransaction.split('.');
  const payload = JSON.parse(
    atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
  );
  return payload;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Authentifier l'utilisateur
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !data.user) {
      throw new Error("Non authentifié");
    }

    const user = data.user;
    console.log('[verify-ios-purchase] User authenticated:', user.id);

    const body = await req.json();
    const { 
      purchase_type, 
      package_id, 
      listing_id, 
      listing_type, 
      product_id, 
      transaction_id 
    } = body;

    console.log('[verify-ios-purchase] Request:', { 
      purchase_type, 
      transaction_id, 
      product_id 
    });

    // ÉTAPE 1: Vérifier la transaction avec l'API App Store
    if (!transaction_id) {
      throw new Error("Transaction ID manquant");
    }

    const transactionData = await verifyTransaction(transaction_id);
    
    // Décoder le signedTransaction
    const signedTransaction = transactionData.signedTransactions?.[0];
    if (!signedTransaction) {
      throw new Error('Aucune transaction signée trouvée');
    }

    const payload = decodeSignedTransaction(signedTransaction);
    console.log('[Transaction] Détails:', {
      bundleId: payload.bundleId,
      productId: payload.productId,
      transactionId: payload.transactionId,
      purchaseDate: payload.purchaseDate,
    });

    // ÉTAPE 2: Valider les données de la transaction
    if (payload.bundleId !== BUNDLE_ID) {
      throw new Error(`Bundle ID invalide: ${payload.bundleId}`);
    }

    // Vérifier que le produit correspond
    const expectedProductId = purchase_type === 'premium_listing' 
      ? `premium_package_${package_id}` 
      : 'com.missdee.carflextest.subscription.pro.monthly';
      
    if (payload.productId !== expectedProductId && payload.productId !== product_id) {
      console.warn(`[Warning] Product ID mismatch: expected ${expectedProductId}, got ${payload.productId}`);
    }

    // ÉTAPE 3: Traiter l'achat selon le type
    if (purchase_type === 'premium_listing') {
      console.log('[verify-ios-purchase] Processing premium listing purchase');

      // Vérifier si le premium n'est pas déjà activé
      const { data: existingPremium } = await supabaseAdmin
        .from("premium_listings")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", listing_id)
        .eq("is_active", true)
        .single();

      if (existingPremium) {
        console.log('[verify-ios-purchase] Premium already active');
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Premium déjà activé",
            already_active: true 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      // Récupérer le package pour obtenir la durée
      const { data: pkg, error: pkgError } = await supabaseAdmin
        .from("premium_packages")
        .select("duration_days")
        .eq("id", package_id)
        .single();

      if (pkgError || !pkg) {
        console.error('[verify-ios-purchase] Package not found:', pkgError);
        throw new Error("Package introuvable");
      }

      console.log('[verify-ios-purchase] Package found:', pkg);

      // Créer l'entrée premium_listings
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + pkg.duration_days);

      const { error: insertError } = await supabaseAdmin
        .from("premium_listings")
        .insert({
          user_id: user.id,
          listing_id: listing_id,
          listing_type: listing_type,
          package_id: package_id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          is_active: true,
        });

      if (insertError) {
        console.error('[verify-ios-purchase] Error inserting premium_listings:', insertError);
        throw insertError;
      }

      console.log('[verify-ios-purchase] Premium listing created successfully');

      // Créer une notification pour l'utilisateur
      await supabaseAdmin.from("notifications").insert({
        user_id: user.id,
        type: "premium_activated",
        title: "Promotion activée !",
        message: `Votre annonce est maintenant promue pour ${pkg.duration_days} jours.`,
        read: false,
      });

      console.log('[verify-ios-purchase] Notification created');

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Premium activé avec succès",
          duration_days: pkg.duration_days,
          verified_by_apple: true
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Gérer les abonnements Pro
    console.log('[verify-ios-purchase] Processing subscription purchase');

    // Récupérer le plan Pro depuis subscription_plans
    const { data: proPlan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('name', 'Pro')
      .single();

    if (planError || !proPlan) {
      console.error('[verify-ios-purchase] Plan Pro not found:', planError);
      throw new Error("Plan Pro introuvable");
    }

    console.log('[verify-ios-purchase] Pro plan found:', proPlan.id);

    // Vérifier si l'abonnement existe déjà
    const { data: existingSubscription } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('product_id', proPlan.stripe_product_id)
      .single();

    // Calculer les dates d'abonnement
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Abonnement mensuel

    if (existingSubscription) {
      // Mettre à jour l'abonnement existant
      const { error: updateError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          status: 'active',
          current_period_end: endDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id);

      if (updateError) {
        console.error('[verify-ios-purchase] Error updating subscription:', updateError);
        throw updateError;
      }

      console.log('[verify-ios-purchase] Subscription updated successfully');
    } else {
      // Créer un nouvel abonnement
      const { error: insertError } = await supabaseAdmin
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          product_id: proPlan.stripe_product_id,
          status: 'active',
          current_period_end: endDate.toISOString()
        });

      if (insertError) {
        console.error('[verify-ios-purchase] Error creating subscription:', insertError);
        throw insertError;
      }

      console.log('[verify-ios-purchase] Subscription created successfully');
    }

    // Créer une notification
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: user.id,
        title: "Abonnement Pro activé",
        message: "Votre abonnement Pro a été activé avec succès !",
        type: 'subscription'
      });

    console.log('[verify-ios-purchase] Abonnement activé avec succès');

    return new Response(
      JSON.stringify({ 
        success: true,
        subscription_end: endDate.toISOString(),
        verified_by_apple: true
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error('[verify-ios-purchase] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
    
    // Déterminer le code d'erreur et le message utilisateur
    let errorCode = 'UNKNOWN_ERROR';
    let userMessage = errorMessage;
    
    // Détecter les différents types d'erreurs avec des messages clairs
    if (errorMessage.includes('4040003') || errorMessage.includes('4040004') || errorMessage.includes('4040005')) {
      errorCode = 'TRANSACTION_NOT_FOUND';
      userMessage = 'Transaction en cours de traitement. Patientez quelques instants et réessayez.';
    } else if (errorMessage.includes('21007') || errorMessage.includes('sandbox')) {
      errorCode = 'SANDBOX_RECEIPT';
      userMessage = 'Validation en cours avec le serveur de test Apple.';
    } else if (errorMessage.includes('not found') && errorMessage.includes('App Store')) {
      errorCode = 'TRANSACTION_NOT_FOUND';
      userMessage = 'Transaction introuvable. Réessayez ou restaurez vos achats.';
    } else if (errorMessage.includes('Bundle ID')) {
      errorCode = 'INVALID_BUNDLE';
      userMessage = 'Erreur de configuration de l\'application. Contactez le support.';
    } else if (errorMessage.includes('Non authentifié')) {
      errorCode = 'AUTH_ERROR';
      userMessage = 'Session expirée. Reconnectez-vous et réessayez.';
    } else if (errorMessage.includes('Transaction ID manquant')) {
      errorCode = 'MISSING_TRANSACTION';
      userMessage = 'Données de transaction manquantes. Réessayez l\'achat.';
    } else if (errorMessage.includes('App Store API')) {
      errorCode = 'APP_STORE_ERROR';
      userMessage = 'Erreur de communication avec l\'App Store. Réessayez dans quelques instants.';
    } else {
      // Message générique amélioré pour éviter "erreur non identifiée"
      userMessage = 'Une erreur est survenue lors de la validation. Essayez de restaurer vos achats ou contactez le support.';
    }
    
    console.error('[verify-ios-purchase] Final error response:', {
      errorCode,
      userMessage,
      originalError: errorMessage
    });
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        error_code: errorCode,
        is_sandbox_error: errorMessage.includes('sandbox') || errorMessage.includes('21007'),
        user_message: userMessage,
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
