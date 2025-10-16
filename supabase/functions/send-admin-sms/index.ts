import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      throw new Error('User is not an admin');
    }

    const { phone, message } = await req.json();

    if (!phone || !message) {
      throw new Error('Phone and message are required');
    }

    // TODO: Intégrer avec un service SMS (Twilio, Vonage, etc.)
    // Pour l'instant, on log juste le message
    console.log(`SMS to ${phone}: ${message}`);

    // Exemple d'intégration Twilio (à activer si vous avez un compte):
    // const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    // const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    // const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
    //
    // const response = await fetch(
    //   `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
    //       'Content-Type': 'application/x-www-form-urlencoded',
    //     },
    //     body: new URLSearchParams({
    //       To: phone,
    //       From: twilioPhoneNumber!,
    //       Body: message,
    //     }),
    //   }
    // );

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SMS envoyé avec succès (mode simulation - configurez un service SMS pour envoyer réellement)' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending SMS:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
