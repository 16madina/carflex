import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, XCircle, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReportedContent {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter_id: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const ModerationPanel = () => {
  const [reports, setReports] = useState<ReportedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('reported_content_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reported_content'
        },
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reported_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch reporter profiles separately
      if (data && data.length > 0) {
        const reporterIds = [...new Set(data.map(r => r.reporter_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', reporterIds);

        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        
        const reportsWithProfiles = data.map(report => ({
          ...report,
          profiles: profilesMap.get(report.reporter_id) || {
            first_name: 'Inconnu',
            last_name: '',
            email: 'N/A'
          }
        }));
        
        setReports(reportsWithProfiles as any);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Erreur lors du chargement des signalements");
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: 'reviewed' | 'resolved' | 'dismissed') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('reported_content')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes[reportId] || null
        })
        .eq('id', reportId);

      if (error) throw error;
      
      toast.success(`Signalement ${status === 'resolved' ? 'résolu' : status === 'dismissed' ? 'rejeté' : 'examiné'}`);
      fetchReports();
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const viewContent = (report: ReportedContent) => {
    switch (report.content_type) {
      case 'sale_listing':
        navigate(`/listing/${report.content_id}`);
        break;
      case 'rental_listing':
        navigate(`/rental/${report.content_id}`);
        break;
      case 'user':
        navigate(`/profile/${report.content_id}`);
        break;
      default:
        toast.error("Type de contenu non supporté");
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      inappropriate: "Contenu inapproprié",
      scam: "Arnaque",
      spam: "Spam",
      harassment: "Harcèlement",
      fake: "Fausses informations",
      other: "Autre"
    };
    return labels[reason] || reason;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'reviewed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Examiné</Badge>;
      case 'resolved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Résolu</Badge>;
      case 'dismissed':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Rejeté</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Statistiques de modération
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-800">{pendingCount}</p>
              <p className="text-sm text-yellow-600">En attente</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-800">
                {reports.filter(r => r.status === 'reviewed').length}
              </p>
              <p className="text-sm text-blue-600">Examinés</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-800">
                {reports.filter(r => r.status === 'resolved').length}
              </p>
              <p className="text-sm text-green-600">Résolus</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-gray-800">{reports.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Aucun signalement pour le moment
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className={report.status === 'pending' ? 'border-yellow-300' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">
                        {getReasonLabel(report.reason)}
                      </h3>
                      {getStatusBadge(report.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Signalé par {report.profiles?.first_name} {report.profiles?.last_name} ({report.profiles?.email})
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(report.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewContent(report)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.description && (
                  <div>
                    <p className="text-sm font-medium mb-1">Description :</p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {report.description}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium mb-2">Type de contenu :</p>
                  <Badge variant="outline">
                    {report.content_type === 'sale_listing' && 'Annonce de vente'}
                    {report.content_type === 'rental_listing' && 'Annonce de location'}
                    {report.content_type === 'user' && 'Utilisateur'}
                    {report.content_type === 'message' && 'Message'}
                  </Badge>
                </div>

                {report.status === 'pending' && (
                  <div className="space-y-3 pt-3 border-t">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Notes admin (optionnel)</Label>
                      <Textarea
                        placeholder="Ajouter des notes..."
                        value={adminNotes[report.id] || ''}
                        onChange={(e) => setAdminNotes({ ...adminNotes, [report.id]: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => updateReportStatus(report.id, 'resolved')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Résolu
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateReportStatus(report.id, 'reviewed')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Marquer comme examiné
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => updateReportStatus(report.id, 'dismissed')}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
