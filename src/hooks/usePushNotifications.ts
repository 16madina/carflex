import { useEffect, useRef } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { toast } from '@/hooks/use-toast';

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
        await PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token: ' + token.value);
          // TODO: Envoyer le token à votre backend
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
