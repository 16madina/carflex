import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { useSplashScreen } from "./hooks/useSplashScreen";
import { usePushNotifications } from "./hooks/usePushNotifications";
import { useAppTracking } from "./hooks/useAppTracking";
import SplashScreen from "./components/SplashScreen";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EmailVerification from "./pages/EmailVerification";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";
import RentalDetail from "./pages/RentalDetail";
import SellType from "./pages/SellType";
import SellForm from "./pages/SellForm";
import RentForm from "./pages/RentForm";
import VehicleEvaluation from "./pages/VehicleEvaluation";
import Messages from "./pages/Messages";
import Bookings from "./pages/Bookings";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import PublicProfile from "./pages/PublicProfile";
import Favorites from "./pages/Favorites";
import AdminPanel from "./pages/AdminPanel";
import PromoteListing from "./pages/PromoteListing";
import Dashboard from "./pages/Dashboard";
import Subscription from "./pages/Subscription";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionPlansAdmin from "./pages/SubscriptionPlansAdmin";
import PaymentSuccess from "./pages/PaymentSuccess";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import DataProtection from "./pages/DataProtection";
import NotFound from "./pages/NotFound";
import AuthSync from "./components/AuthSync";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showATTDialog, setShowATTDialog] = useState(false);
  
  // Initialise le splash screen natif et les push notifications
  useSplashScreen();
  usePushNotifications();
  const { hasRequestedPermission, requestTrackingPermission } = useAppTracking();

  useEffect(() => {
    // Show ATT dialog after splash screen, only once
    if (!showSplash && !hasRequestedPermission) {
      const timer = setTimeout(() => {
        setShowATTDialog(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showSplash, hasRequestedPermission]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  const handleATTAccept = async () => {
    await requestTrackingPermission();
    setShowATTDialog(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SubscriptionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          
          {/* App Tracking Transparency Dialog */}
          <AlertDialog open={showATTDialog} onOpenChange={setShowATTDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confidentialité des données</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>
                    CarFlex collecte des informations de base (email, nom, téléphone) 
                    uniquement pour le fonctionnement de l'application :
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Créer et gérer votre compte</li>
                    <li>Permettre la messagerie entre utilisateurs</li>
                    <li>Gérer vos annonces et réservations</li>
                  </ul>
                  <p className="font-semibold mt-2">
                    Aucun suivi publicitaire n'est effectué.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogAction onClick={handleATTAccept}>
                J'ai compris
              </AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>

          <BrowserRouter>
            <AuthSync />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listing/:id" element={<ListingDetail />} />
              <Route path="/rental/:id" element={<RentalDetail />} />
              <Route path="/sell" element={<SellType />} />
              <Route path="/sell/vendre" element={<SellForm />} />
              <Route path="/sell/louer" element={<RentForm />} />
              <Route path="/sell/evaluer" element={<VehicleEvaluation />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<ProfileEdit />} />
              <Route path="/profile/:userId" element={<PublicProfile />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/subscription-plans" element={<SubscriptionPlansAdmin />} />
              <Route path="/promote" element={<PromoteListing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/subscription-success" element={<SubscriptionSuccess />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/data-protection" element={<DataProtection />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
    </QueryClientProvider>
  );
};

export default App;
