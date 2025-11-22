import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, CheckCircle, XCircle, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface TestDriveRequest {
  id: string;
  listing_id: string;
  listing_type: string;
  requester_id: string;
  seller_id: string;
  preferred_date: string;
  preferred_time: string;
  message: string | null;
  status: string;
  created_at: string;
  requester?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    phone: string | null;
  };
  listing?: {
    brand: string;
    model: string;
  };
}

export const TestDriveRequestsList = () => {
  const [requests, setRequests] = useState<TestDriveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchRequests();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("test_drive_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "test_drive_requests",
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Fetch requests where current user is the seller
      const { data: sellerRequests, error: sellerError } = await supabase
        .from("test_drive_requests")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (sellerError) throw sellerError;

      // Fetch requester and listing details for each request
      const requestsWithDetails = await Promise.all(
        (sellerRequests || []).map(async (request) => {
          // Fetch requester profile
          const { data: requester } = await supabase
            .from("profiles")
            .select("first_name, last_name, avatar_url, phone")
            .eq("id", request.requester_id)
            .single();

          // Fetch listing details
          const table = request.listing_type === "sale" ? "sale_listings" : "rental_listings";
          
          const { data: listing } = await supabase
            .from(table)
            .select("brand, model")
            .eq("id", request.listing_id)
            .single();

          return {
            ...request,
            requester,
            listing,
          };
        })
      );

      setRequests(requestsWithDetails);
    } catch (error) {
      console.error("Error fetching test drive requests:", error);
      toast.error("Erreur lors du chargement des demandes");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("test_drive_requests")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) throw error;

      toast.success(
        newStatus === "approved" 
          ? "Demande approuvée !" 
          : "Demande refusée"
      );

      fetchRequests();
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (activeTab === "all") return true;
    return req.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">En attente</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Approuvée</Badge>;
      case "rejected":
        return <Badge variant="destructive">Refusée</Badge>;
      case "cancelled":
        return <Badge variant="outline">Annulée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Demandes d'essai</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demandes d'essai</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              En attente ({requests.filter(r => r.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approuvées ({requests.filter(r => r.status === "approved").length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Refusées ({requests.filter(r => r.status === "rejected").length})
            </TabsTrigger>
            <TabsTrigger value="all">
              Toutes ({requests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-4">
            {filteredRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune demande d'essai
              </p>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={request.requester?.avatar_url || ""} />
                            <AvatarFallback>
                              <UserIcon className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">
                              {request.requester?.first_name} {request.requester?.last_name}
                            </p>
                            {request.requester?.phone && (
                              <p className="text-sm text-muted-foreground">
                                {request.requester.phone}
                              </p>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>

                      <Separator />

                      {/* Vehicle Info */}
                      <div>
                        <p className="text-sm text-muted-foreground">Véhicule</p>
                        <p className="font-medium">
                          {request.listing?.brand} {request.listing?.model}
                        </p>
                      </div>

                      {/* Date & Time */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="font-medium">
                              {format(new Date(request.preferred_date), "PPP", { locale: fr })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Heure</p>
                            <p className="font-medium">{request.preferred_time}</p>
                          </div>
                        </div>
                      </div>

                      {/* Message */}
                      {request.message && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Message</p>
                          <p className="text-sm bg-muted p-3 rounded-md">
                            {request.message}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      {request.status === "pending" && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(request.id, "approved")}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateStatus(request.id, "rejected")}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Refuser
                          </Button>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Demandé le {format(new Date(request.created_at), "PPP 'à' p", { locale: fr })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
