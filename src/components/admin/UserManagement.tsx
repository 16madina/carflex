import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { UserX, MessageSquare, Send, UserPlus, Trash2, ShieldCheck, AlertTriangle } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_type: string;
  phone: string | null;
  banned: boolean | null;
  ban_reason: string | null;
  created_at: string;
}

interface Listing {
  id: string;
  type: 'sale' | 'rental';
  brand: string;
  model: string;
  year: number;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [banReason, setBanReason] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchListings();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    try {
      const { data: saleListings, error: saleError } = await supabase
        .from("sale_listings")
        .select("id, brand, model, year")
        .limit(100);

      const { data: rentalListings, error: rentalError } = await supabase
        .from("rental_listings")
        .select("id, brand, model, year")
        .limit(100);

      if (saleError) throw saleError;
      if (rentalError) throw rentalError;

      const allListings = [
        ...(saleListings || []).map(l => ({ ...l, type: 'sale' as const })),
        ...(rentalListings || []).map(l => ({ ...l, type: 'rental' as const })),
      ];

      setListings(allListings);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };

  const handleBanUser = async (userId: string, ban: boolean) => {
    if (ban && !banReason.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez fournir une raison pour le bannissement",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          banned: ban,
          ban_reason: ban ? banReason : null,
          banned_at: ban ? new Date().toISOString() : null,
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: ban ? "Utilisateur banni" : "Utilisateur débanni",
        description: ban 
          ? "L'utilisateur a été banni avec succès" 
          : "L'utilisateur peut à nouveau accéder à la plateforme",
      });

      setBanReason("");
      fetchUsers();
    } catch (error) {
      console.error("Error banning user:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'utilisateur",
        variant: "destructive",
      });
    }
  };

  const handleSendWarning = async () => {
    if (!selectedUser || !warningMessage.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un utilisateur et écrire un message",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase
        .from("user_warnings")
        .insert({
          user_id: selectedUser.id,
          admin_id: user.id,
          warning_message: warningMessage,
        });

      if (error) throw error;

      // Create a notification for the user
      await supabase
        .from("notifications")
        .insert({
          user_id: selectedUser.id,
          title: "Avertissement d'un administrateur",
          message: warningMessage,
          type: "warning",
        });

      toast({
        title: "Avertissement envoyé",
        description: "L'utilisateur a reçu votre avertissement",
      });

      setWarningMessage("");
      setSelectedUser(null);
    } catch (error) {
      console.error("Error sending warning:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'avertissement",
        variant: "destructive",
      });
    }
  };

  const handleSendSMS = async () => {
    if (!selectedUser || !selectedUser.phone || !smsMessage.trim()) {
      toast({
        title: "Erreur",
        description: "L'utilisateur doit avoir un numéro de téléphone",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-admin-sms', {
        body: {
          phone: selectedUser.phone,
          message: smsMessage,
        },
      });

      if (error) throw error;

      toast({
        title: "SMS envoyé",
        description: data.message,
      });

      setSmsMessage("");
      setSelectedUser(null);
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le SMS",
        variant: "destructive",
      });
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    if (!confirm("Voulez-vous vraiment donner les droits d'administrateur à cet utilisateur ?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role: "admin",
        });

      if (error) {
        // If role already exists
        if (error.code === "23505") {
          toast({
            title: "Information",
            description: "Cet utilisateur est déjà administrateur",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Administrateur ajouté",
        description: "L'utilisateur a maintenant les droits d'administrateur",
      });
    } catch (error) {
      console.error("Error making admin:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les droits d'administrateur",
        variant: "destructive",
      });
    }
  };

  const handleDeleteListing = async () => {
    if (!selectedListing || !confirm("Voulez-vous vraiment supprimer cette annonce ?")) {
      return;
    }

    try {
      const tableName = selectedListing.type === 'sale' ? 'sale_listings' : 'rental_listings';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", selectedListing.id);

      if (error) throw error;

      toast({
        title: "Annonce supprimée",
        description: "L'annonce a été supprimée avec succès",
      });

      setSelectedListing(null);
      fetchListings();
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'annonce",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => 
    !searchEmail || user.email?.toLowerCase().includes(searchEmail.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Utilisateurs</CardTitle>
          <CardDescription>
            Gérez les utilisateurs, bannissements, avertissements et annonces
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Rechercher un utilisateur par email</Label>
              <Input
                id="search"
                placeholder="email@example.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.first_name} {user.last_name}</TableCell>
                    <TableCell>{user.user_type}</TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell>
                      {user.banned ? (
                        <Badge variant="destructive">Banni</Badge>
                      ) : (
                        <Badge variant="outline">Actif</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* Ban/Unban Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant={user.banned ? "outline" : "destructive"}>
                              <UserX className="h-4 w-4 mr-1" />
                              {user.banned ? "Débannir" : "Bannir"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                {user.banned ? "Débannir" : "Bannir"} l'utilisateur
                              </DialogTitle>
                              <DialogDescription>
                                {user.banned 
                                  ? "L'utilisateur pourra à nouveau accéder à la plateforme"
                                  : "L'utilisateur ne pourra plus accéder à la plateforme"
                                }
                              </DialogDescription>
                            </DialogHeader>
                            {!user.banned && (
                              <div className="space-y-2">
                                <Label>Raison du bannissement</Label>
                                <Textarea
                                  value={banReason}
                                  onChange={(e) => setBanReason(e.target.value)}
                                  placeholder="Expliquez la raison..."
                                />
                              </div>
                            )}
                            {user.banned && user.ban_reason && (
                              <div className="space-y-2">
                                <Label>Raison du bannissement actuel:</Label>
                                <p className="text-sm text-muted-foreground">{user.ban_reason}</p>
                              </div>
                            )}
                            <Button 
                              onClick={() => handleBanUser(user.id, !user.banned)}
                              variant={user.banned ? "default" : "destructive"}
                            >
                              Confirmer
                            </Button>
                          </DialogContent>
                        </Dialog>

                        {/* Warning Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedUser(user)}
                            >
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Avertir
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Envoyer un avertissement</DialogTitle>
                              <DialogDescription>
                                L'utilisateur recevra une notification avec votre message
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2">
                              <Label>Message d'avertissement</Label>
                              <Textarea
                                value={warningMessage}
                                onChange={(e) => setWarningMessage(e.target.value)}
                                placeholder="Écrivez votre message..."
                                rows={4}
                              />
                            </div>
                            <Button onClick={handleSendWarning}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Envoyer l'avertissement
                            </Button>
                          </DialogContent>
                        </Dialog>

                        {/* SMS Dialog */}
                        {user.phone && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                SMS
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Envoyer un SMS</DialogTitle>
                                <DialogDescription>
                                  Envoyer un message SMS à {user.phone}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-2">
                                <Label>Message SMS</Label>
                                <Textarea
                                  value={smsMessage}
                                  onChange={(e) => setSmsMessage(e.target.value)}
                                  placeholder="Écrivez votre message..."
                                  rows={3}
                                  maxLength={160}
                                />
                                <p className="text-xs text-muted-foreground">
                                  {smsMessage.length}/160 caractères
                                </p>
                              </div>
                              <Button onClick={handleSendSMS}>
                                <Send className="h-4 w-4 mr-2" />
                                Envoyer le SMS
                              </Button>
                            </DialogContent>
                          </Dialog>
                        )}

                        {/* Make Admin */}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMakeAdmin(user.id)}
                        >
                          <ShieldCheck className="h-4 w-4 mr-1" />
                          Admin
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Listing */}
      <Card>
        <CardHeader>
          <CardTitle>Supprimer une Annonce</CardTitle>
          <CardDescription>
            Sélectionnez une annonce pour la supprimer définitivement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Sélectionner une annonce</Label>
              <div className="grid grid-cols-1 gap-2 mt-2 max-h-64 overflow-y-auto">
                {listings.map((listing) => (
                  <div
                    key={listing.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-accent ${
                      selectedListing?.id === listing.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedListing(listing)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {listing.year} {listing.brand} {listing.model}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Type: {listing.type === 'sale' ? 'Vente' : 'Location'}
                        </p>
                      </div>
                      {selectedListing?.id === listing.id && (
                        <Badge>Sélectionné</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {selectedListing && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteListing}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer l'annonce sélectionnée
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
