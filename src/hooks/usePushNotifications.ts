import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Vérifie si on est sur une plateforme native
    if (!Capacitor.isNativePlatform()) {
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
        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token: ' + token.value);
          // TODO: Envoyer le token à votre backend
        });

        // Listener: erreur d'enregistrement
        PushNotifications.addListener('registrationError', (error) => {
          console.log('Error on registration: ' + JSON.stringify(error));
        });

        // Listener: notification reçue quand l'app est ouverte
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
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
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification action performed', notification.actionId, notification.notification);
        });
      } catch (error) {
        // Erreur silencieuse pour ne pas crasher l'app
        console.log('Notifications push non configurées ou non disponibles');
      }
    };

    initPushNotifications();

    // Cleanup avec gestion d'erreur
    return () => {
      try {
        if (PushNotifications) {
          PushNotifications.removeAllListeners();
        }
      } catch (error) {
        console.log('Erreur lors du cleanup des notifications');
      }
    };
  }, [toast]);
};
