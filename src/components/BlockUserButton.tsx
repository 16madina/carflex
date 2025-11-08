import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BlockUserButtonProps {
  userId: string;
  userName?: string;
  onBlocked?: () => void;
}

const BlockUserButton = ({ userId, userName, onBlocked }: BlockUserButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Vous devez être connecté");
        return;
      }

      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: session.user.id,
          blocked_id: userId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error("Vous avez déjà bloqué cet utilisateur");
        } else {
          throw error;
        }
        return;
      }

      toast.success(`${userName || "L'utilisateur"} a été bloqué. Vous ne verrez plus ses annonces et messages.`);
      onBlocked?.();
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Erreur lors du blocage de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Ban className="w-4 h-4 mr-2" />
          Bloquer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bloquer cet utilisateur ?</AlertDialogTitle>
          <AlertDialogDescription>
            Vous ne verrez plus les annonces et messages de {userName || "cet utilisateur"}. 
            Cette action est réversible depuis votre page de profil.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleBlock} disabled={loading}>
            {loading ? "Blocage..." : "Bloquer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BlockUserButton;
