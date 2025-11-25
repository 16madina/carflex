import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { AppTrackingTransparency, AppTrackingStatus } from 'capacitor-plugin-app-tracking-transparency';

const ATT_DIALOG_SHOWN_KEY = 'att_dialog_shown';

// Fonction pour mapper le statut du plugin au format de notre state
const mapStatus = (status: AppTrackingStatus): 'not-determined' | 'authorized' | 'denied' | 'restricted' => {
  if (status === 'notDetermined') return 'not-determined';
  return status as 'authorized' | 'denied' | 'restricted';
};

export const useAppTracking = () => {
  const [trackingStatus, setTrackingStatus] = useState<'not-determined' | 'authorized' | 'denied' | 'restricted'>('not-determined');
  const [hasRequestedPermission, setHasRequestedPermission] = useState(true);

  useEffect(() => {
    const checkAndRequestATT = async () => {
      // Only on iOS native platform
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
        console.log('[ATT] Not on iOS, skipping');
        return;
      }

      try {
        // Vérifier le statut actuel
        const currentStatus = await AppTrackingTransparency.getStatus();
        console.log('[ATT] Current status:', currentStatus);
        setTrackingStatus(mapStatus(currentStatus.status));

        // Si le statut est "notDetermined", on doit demander la permission
        if (currentStatus.status === 'notDetermined') {
          setHasRequestedPermission(false);
          
          // Attendre que l'app soit complètement chargée avant d'afficher le dialogue
          console.log('[ATT] Status is notDetermined, will request permission in 1.5s');
          setTimeout(async () => {
            console.log('[ATT] Requesting tracking permission...');
            await requestTrackingPermission();
          }, 1500);
        } else {
          console.log('[ATT] Permission already determined:', currentStatus.status);
          setHasRequestedPermission(true);
        }
      } catch (error) {
        console.error('[ATT] Error checking status:', error);
      }
    };

    checkAndRequestATT();
  }, []);

  const requestTrackingPermission = async () => {
    // Only on iOS native
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      console.log('[ATT] Not on iOS, cannot request permission');
      return;
    }

    try {
      console.log('[ATT] Calling AppTrackingTransparency.requestPermission()...');
      const result = await AppTrackingTransparency.requestPermission();
      console.log('[ATT] Permission result:', result);
      
      setTrackingStatus(mapStatus(result.status));
      setHasRequestedPermission(true);
      localStorage.setItem(ATT_DIALOG_SHOWN_KEY, 'true');
      
      console.log('[ATT] Permission request completed, status:', result.status);
    } catch (error) {
      console.error('[ATT] Error requesting tracking permission:', error);
      setHasRequestedPermission(true);
      // Continue app functionality even if tracking fails
    }
  };

  const shouldShowDialog = () => {
    const dialogShown = localStorage.getItem(ATT_DIALOG_SHOWN_KEY);
    return dialogShown !== 'true';
  };

  return {
    trackingStatus,
    hasRequestedPermission,
    requestTrackingPermission,
    shouldShowDialog,
  };
};
