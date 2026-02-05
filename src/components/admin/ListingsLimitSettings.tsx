import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileText, Save, Loader2, User, Building2, Briefcase } from 'lucide-react';

interface LimitConfig {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  defaultValue: number;
}

const LIMIT_CONFIGS: LimitConfig[] = [
  {
    key: 'free_listings_limit',
    label: 'Utilisateurs (Particuliers)',
    description: 'Acheteurs et vendeurs particuliers',
    icon: User,
    defaultValue: 5,
  },
  {
    key: 'free_listings_limit_agent',
    label: 'Agents immobiliers',
    description: 'Agents et courtiers automobiles',
    icon: Briefcase,
    defaultValue: 15,
  },
  {
    key: 'free_listings_limit_dealer',
    label: 'Concessionnaires',
    description: 'Garages et concessionnaires automobiles',
    icon: Building2,
    defaultValue: 20,
  },
];

export const ListingsLimitSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [limits, setLimits] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings_numeric')
        .select('setting_key, setting_value')
        .in('setting_key', LIMIT_CONFIGS.map(c => c.key));

      if (error) throw error;

      const limitsMap: Record<string, number> = {};
      LIMIT_CONFIGS.forEach(config => {
        const found = data?.find(d => d.setting_key === config.key);
        limitsMap[config.key] = found?.setting_value ?? config.defaultValue;
      });

      setLimits(limitsMap);
    } catch (err) {
      console.error('Error fetching limits:', err);
      toast({
        title: "Erreur",
        description: "Impossible de charger les limites d'annonces",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate all limits
    for (const config of LIMIT_CONFIGS) {
      if ((limits[config.key] ?? 0) < 1) {
        toast({
          title: "Erreur",
          description: `La limite pour ${config.label} doit être au moins de 1`,
          variant: "destructive"
        });
        return;
      }
    }

    setSaving(true);
    try {
      // Update all limits
      for (const config of LIMIT_CONFIGS) {
        const { error } = await supabase
          .from('app_settings_numeric')
          .update({ setting_value: limits[config.key], updated_at: new Date().toISOString() })
          .eq('setting_key', config.key);

        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: "Limites d'annonces mises à jour"
      });
    } catch (err) {
      console.error('Error saving limits:', err);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les limites",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateLimit = (key: string, value: number) => {
    setLimits(prev => ({ ...prev, [key]: value }));
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
          Limites d'annonces gratuites
        </CardTitle>
        <CardDescription>
          Définissez le nombre maximum d'annonces gratuites par mois pour chaque type d'utilisateur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {LIMIT_CONFIGS.map((config) => {
            const Icon = config.icon;
            return (
              <div key={config.key} className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <Label className="font-medium">{config.label}</Label>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={limits[config.key] ?? config.defaultValue}
                    onChange={(e) => updateLimit(config.key, parseInt(e.target.value) || 1)}
                    className="text-center text-lg font-semibold"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">/ mois</span>
                </div>
              </div>
            );
          })}
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer les limites
            </>
          )}
        </Button>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">Comment ça fonctionne:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Chaque type d'utilisateur a sa propre limite mensuelle</li>
            <li>Les limites se réinitialisent au début de chaque mois</li>
            <li>Les annonces de vente et de location sont comptées ensemble</li>
            <li>Un message d'erreur s'affiche quand la limite est atteinte</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};