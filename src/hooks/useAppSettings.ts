import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AppSetting {
  id: string;
  setting_key: string;
  setting_value: boolean;
  description: string | null;
}

export const useAppSettings = () => {
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*');

      if (error) throw error;

      const settingsMap: Record<string, boolean> = {};
      data?.forEach((setting: AppSetting) => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });

      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching app settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    // Subscribe to changes
    const channel = supabase
      .channel('app_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_settings',
        },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { settings, loading, refetch: fetchSettings };
};
