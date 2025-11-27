import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { ThemeProvider } from "next-themes";
import { useSplashScreen } from "./hooks/useSplashScreen";
import { usePushNotifications } from "./hooks/usePushNotifications";
import { useAppTracking } from "./hooks/useAppTracking";
import SplashScreen from "./components/SplashScreen";
import AuthSync from "./components/AuthSync";

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
import FAQ from "./pages/FAQ";
import SocialLinks from "./pages/SocialLinks";
import NotificationPreferences from "./pages/NotificationPreferences";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  // Initialize core hooks
  useSplashScreen();
  usePushNotifications();
  useAppTracking();

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>

      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>


      <SubscriptionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
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
              <Route path="/profile/social-links" element={<SocialLinks />} />
              <Route path="/profile/notification-preferences" element={<NotificationPreferences />} />
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
              <Route path="/faq" element={<FAQ />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
