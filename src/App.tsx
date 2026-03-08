import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import BookPage from "./pages/BookPage";
import AdminDashboard from "./pages/AdminDashboard";
import Categories from "./pages/Categories";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import AffiliateDisclosure from "./pages/AffiliateDisclosure";
import DMCA from "./pages/DMCA";
import AboutUs from "./pages/AboutUs";
import CookiePolicy from "./pages/CookiePolicy";
import NotFound from "./pages/NotFound";
import Subscribe from "./pages/Subscribe";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:category" element={<CategoryPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/affiliate-disclosure" element={<AffiliateDisclosure />} />
            <Route path="/dmca" element={<DMCA />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/:slug" element={<BookPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
