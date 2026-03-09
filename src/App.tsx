import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import usePageViewTracker from "@/hooks/usePageViewTracker";
import ScrollToTop from "@/components/ScrollToTop";
import CookieConsent from "@/components/CookieConsent";
import { lazy, Suspense } from "react";

// Eager load critical route
import Index from "./pages/Index";

// Lazy load non-critical routes
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const BookPage = lazy(() => import("./pages/BookPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Categories = lazy(() => import("./pages/Categories"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const AffiliateDisclosure = lazy(() => import("./pages/AffiliateDisclosure"));
const DMCA = lazy(() => import("./pages/DMCA"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Subscribe = lazy(() => import("./pages/Subscribe"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageViewTracker = () => {
  usePageViewTracker();
  return null;
};

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-xs text-muted-foreground">Loading…</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <PageViewTracker />
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
          <CookieConsent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
