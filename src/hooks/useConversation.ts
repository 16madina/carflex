import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useConversation = (listingId: string, sellerId: string) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrCreateConversation();
  }, [listingId, sellerId]);

  const getOrCreateConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${sellerId}),and(participant1_id.eq.${sellerId},participant2_id.eq.${user.id})`)
        .eq("listing_id", listingId)
        .maybeSingle();

      if (existing) {
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
          listing_id: listingId
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
