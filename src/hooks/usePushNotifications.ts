import { useEffect, useRef } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePushNotifications = () => {
  const isInitialized = useRef(false);

  useEffect(() => {
    // Vérifie si on est sur une plateforme native et si pas déjà initialisé
    if (!Capacitor.isNativePlatform() || isInitialized.current) {
      return;
    }

    const initPushNotifications = async () => {
      try {
        // Vérifie si l'API est disponible
        if (!PushNotifications) {
          console.log('Push notifications API non disponible');
          return;
        }

        // Demande la permission avec gestion d'erreur
        let permStatus;
        try {
          permStatus = await PushNotifications.checkPermissions();
        } catch (error) {
          console.log('Permissions non disponibles:', error);
          return;
        }

        if (permStatus.receive === 'prompt') {
          try {
            permStatus = await PushNotifications.requestPermissions();
          } catch (error) {
            console.log('Impossible de demander les permissions:', error);
            return;
          }
        }

        if (permStatus.receive !== 'granted') {
          console.log('Permission notifications refusée');
          return;
        }

        // S'enregistrer pour recevoir les notifications
        try {
          await PushNotifications.register();
        } catch (error) {
          console.log('Impossible d\'enregistrer pour les notifications:', error);
          return;
        }

        // Listener: notification reçue
        await PushNotifications.addListener('registration', async (token) => {
          console.log('Push registration success, token: ' + token.value);
          
          // Enregistrer le token dans la base de données
          try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
              const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
              
              await supabase
                .from('push_notification_tokens')
                .upsert({
                  user_id: user.id,
                  token: token.value,
                  platform: platform,
                  device_info: {
                    platform: platform,
                    capacitor_version: Capacitor.getPlatform(),
                  },
                  last_used_at: new Date().toISOString(),
                }, {
                  onConflict: 'user_id,token',
                });
              
              console.log('Token enregistré avec succès dans la DB');
            }
          } catch (error) {
            console.error('Erreur lors de l\'enregistrement du token:', error);
          }
        });

        // Listener: erreur d'enregistrement
        await PushNotifications.addListener('registrationError', (error) => {
          console.log('Error on registration: ' + JSON.stringify(error));
        });

        // Listener: notification reçue quand l'app est ouverte
        await PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received: ', notification);
          try {
            toast({
              title: notification.title || 'Nouvelle notification',
              description: notification.body,
            });
          } catch (error) {
            console.log('Erreur affichage toast:', error);
          }
        });

        // Listener: notification cliquée
        await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification action performed', notification.actionId, notification.notification);
        });

        isInitialized.current = true;
      } catch (error) {
        // Erreur silencieuse pour ne pas crasher l'app
        console.log('Notifications push non configurées ou non disponibles:', error);
      }
    };

    initPushNotifications();

    // Cleanup avec gestion d'erreur
    return () => {
      if (isInitialized.current) {
        try {
          PushNotifications.removeAllListeners().catch(() => {
            console.log('Erreur lors du cleanup des notifications');
          });
        } catch (error) {
          console.log('Erreur lors du cleanup des notifications');
        }
      }
    };
  }, []);
};
