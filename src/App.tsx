import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
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
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import DataProtection from "./pages/DataProtection";
import NotFound from "./pages/NotFound";
import AuthSync from "./components/AuthSync";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SubscriptionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthSync />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
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
            <Route path="/promote" element={<PromoteListing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/subscription-success" element={<SubscriptionSuccess />} />
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

export default App;
