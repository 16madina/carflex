import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

const ATT_DIALOG_SHOWN_KEY = 'att_dialog_shown';

export const useAppTracking = () => {
  const [trackingStatus, setTrackingStatus] = useState<'not-determined' | 'authorized' | 'denied' | 'restricted'>('not-determined');
  const [hasRequestedPermission, setHasRequestedPermission] = useState(true);

  useEffect(() => {
    // Check if dialog has been shown before
    const dialogShown = localStorage.getItem(ATT_DIALOG_SHOWN_KEY);
    if (dialogShown === 'true') {
      setHasRequestedPermission(true);
    } else {
      setHasRequestedPermission(false);
    }
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
