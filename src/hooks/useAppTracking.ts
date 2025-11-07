import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

export const useAppTracking = () => {
  const [trackingStatus, setTrackingStatus] = useState<'not-determined' | 'authorized' | 'denied' | 'restricted'>('not-determined');
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false);

  useEffect(() => {
    // Check if already requested in this session
    const requested = localStorage.getItem('att_requested');
    if (requested) {
      setHasRequestedPermission(true);
    }
  }, []);

  const requestTrackingPermission = async () => {
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
      
      // Mark as requested
      localStorage.setItem('att_requested', 'true');
      setHasRequestedPermission(true);
    } catch (error) {
      console.error('Error requesting tracking permission:', error);
      // Continue app functionality even if tracking fails
      localStorage.setItem('att_requested', 'true');
      setHasRequestedPermission(true);
    }
  };

  return {
    trackingStatus,
    hasRequestedPermission,
    requestTrackingPermission,
  };
};
