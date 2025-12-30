import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileText, Save, Loader2 } from 'lucide-react';

export const ListingsLimitSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [limit, setLimit] = useState(5);
  const { toast } = useToast();

  useEffect(() => {
    fetchLimit();
  }, []);

  const fetchLimit = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings_numeric')
        .select('setting_value')
        .eq('setting_key', 'free_listings_limit')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setLimit(data.setting_value);
      }
    } catch (err) {
      console.error('Error fetching limit:', err);
      toast({
        title: "Erreur",
        description: "Impossible de charger la limite d'annonces",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (limit < 1) {
      toast({
        title: "Erreur",
        description: "La limite doit être au moins de 1 annonce",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('app_settings_numeric')
        .update({ setting_value: limit, updated_at: new Date().toISOString() })
        .eq('setting_key', 'free_listings_limit');

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Limite mise à jour: ${limit} annonces gratuites par mois`
      });
    } catch (err) {
      console.error('Error saving limit:', err);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la limite",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Limite d'annonces gratuites
        </CardTitle>
        <CardDescription>
          Définissez le nombre maximum d'annonces gratuites que chaque utilisateur peut publier par mois
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="listings-limit">Nombre d'annonces gratuites par mois</Label>
          <div className="flex gap-4 items-end">
            <div className="flex-1 max-w-xs">
              <Input
                id="listings-limit"
                type="number"
                min={1}
                max={100}
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 1)}
                className="text-lg"
              />
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Chaque utilisateur pourra publier jusqu'à {limit} annonce{limit > 1 ? 's' : ''} gratuitement par mois (ventes + locations combinées).
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">Comment ça fonctionne:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>La limite se réinitialise au début de chaque mois</li>
            <li>Les annonces de vente et de location sont comptées ensemble</li>
            <li>Un message d'erreur s'affiche quand la limite est atteinte</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
