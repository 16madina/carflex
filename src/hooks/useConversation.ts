import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useConversation = (listingId: string, sellerId: string, listingType: 'sale' | 'rental' = 'sale') => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrCreateConversation();
  }, [listingId, sellerId, listingType]);

  const getOrCreateConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !sellerId || !listingId) {
        setLoading(false);
        return;
      }

      // Check if conversation already exists (with any listing_type)
      const { data: existing } = await supabase
        .from("conversations")
        .select("id, listing_type")
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${sellerId}),and(participant1_id.eq.${sellerId},participant2_id.eq.${user.id})`)
        .eq("listing_id", listingId)
        .maybeSingle();

      if (existing) {
        // Si le listing_type est incorrect, le corriger
        if (existing.listing_type !== listingType) {
          const { error: updateError } = await supabase
            .from("conversations")
            .update({ listing_type: listingType })
            .eq("id", existing.id);

          if (updateError) {
            console.error("Error updating conversation listing_type:", updateError);
          }
        }
        
        setConversationId(existing.id);
        setLoading(false);
        return;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({
          participant1_id: user.id,
          participant2_id: sellerId,
          listing_id: listingId,
          listing_type: listingType
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error creating conversation:", error);
        toast.error("Erreur lors de la création de la conversation");
      } else {
        setConversationId(newConv.id);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return { conversationId, loading };
};
