import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

const ATT_DIALOG_SHOWN_KEY = 'att_dialog_shown';

export const useAppTracking = () => {
  const [trackingStatus, setTrackingStatus] = useState<'not-determined' | 'authorized' | 'denied' | 'restricted'>('not-determined');
  const [hasRequestedPermission, setHasRequestedPermission] = useState(true);

  useEffect(() => {
    const checkAndRequestATT = async () => {
      // Only on iOS native platform
      if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
        return;
      }

      // Check if we've already shown the dialog
      const dialogShown = localStorage.getItem(ATT_DIALOG_SHOWN_KEY);
      
      if (dialogShown === 'true') {
        setHasRequestedPermission(true);
      } else {
        setHasRequestedPermission(false);
        
        // Wait for app to fully load, then show ATT
        setTimeout(async () => {
          console.log('[ATT] Requesting tracking permission automatically...');
          await requestTrackingPermission();
        }, 1500); // Show after 1.5 seconds
      }
    };

    checkAndRequestATT();
  }, []);

  const requestTrackingPermission = async () => {
    // Mark dialog as shown first
    localStorage.setItem(ATT_DIALOG_SHOWN_KEY, 'true');
    setHasRequestedPermission(true);

    // Only on iOS native
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
      return;
    }

    try {
      // Try to use the plugin if available
      const AppTrackingTransparency = (window as any).AppTrackingTransparency;
      
      if (AppTrackingTransparency) {
        const status = await AppTrackingTransparency.requestPermission();
        setTrackingStatus(status.status);
      }
    } catch (error) {
      console.error('Error requesting tracking permission:', error);
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
