import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppErrorDialog from "@/components/AppErrorDialog";
import Layout from "@/components/Layout";
import PwaRuntime from "@/components/PwaRuntime";
import { PublicUserProvider, usePublicUser } from "@/context/PublicUserContext";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Chat from "@/pages/Chat";
import Transactions from "@/pages/Transactions";
import Goals from "@/pages/Goals";
import Settings from "@/pages/Settings";
import FinancialStatement from "@/pages/FinancialStatement";
import Insights from "@/pages/Insights";
import News from "@/pages/News";
import StockPicks from "@/pages/StockPicks";
import Subscriptions from "@/pages/Subscriptions";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/NotFound";
import Install from "@/pages/Install";
import Budget from "@/pages/Budget";
import SpendingHistory from "@/pages/SpendingHistory";
import Onboarding from "@/pages/Onboarding";
import Auth from "@/pages/Auth";

const queryClient = new QueryClient();

const AppPage = ({ children }: { children: React.ReactNode }) => (
  <>
    <Layout>{children}</Layout>
  </>
);

function FullPageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading your workspace...</p>
      </div>
    </div>
  );
}

function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { bootstrap, isAuthenticated, loading, requiresPasswordSetup } = usePublicUser();
  const location = useLocation();

  if (loading) {
    return <FullPageLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth?mode=signin" replace state={{ from: location.pathname }} />;
  }

  if (requiresPasswordSetup) {
    return <Navigate to="/auth?mode=set-password" replace state={{ from: location.pathname }} />;
  }

  if (!bootstrap.has_onboarded) {
    return <Navigate to="/onboarding" replace state={{ from: location.pathname }} />;
  }

  return <AppPage>{children}</AppPage>;
}

function OnboardingPage() {
  const { bootstrap, isAuthenticated, loading, requiresPasswordSetup } = usePublicUser();

  if (loading) {
    return <FullPageLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth?mode=signin" replace />;
  }

  if (requiresPasswordSetup) {
    return <Navigate to="/auth?mode=set-password" replace />;
  }

  if (bootstrap.has_onboarded) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Onboarding />;
}

function AuthPage() {
  const { bootstrap, isAuthenticated, loading, requiresPasswordSetup } = usePublicUser();

  if (loading) {
    return <FullPageLoading />;
  }

  if (isAuthenticated) {
    if (requiresPasswordSetup) {
      return <Auth forcedMode="set-password" />;
    }
    return <Navigate to={bootstrap.has_onboarded ? "/dashboard" : "/onboarding"} replace />;
  }

  return <Auth />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppErrorDialog />
      <BrowserRouter>
        <PublicUserProvider>
          <PwaRuntime />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
            <Route path="/chat" element={<ProtectedPage><Chat /></ProtectedPage>} />
            <Route path="/transactions" element={<ProtectedPage><Transactions /></ProtectedPage>} />
            <Route path="/goals" element={<ProtectedPage><Goals /></ProtectedPage>} />
            <Route path="/subscriptions" element={<ProtectedPage><Subscriptions /></ProtectedPage>} />
            <Route path="/settings" element={<ProtectedPage><Settings /></ProtectedPage>} />
            <Route path="/financial-statement" element={<ProtectedPage><FinancialStatement /></ProtectedPage>} />
            <Route path="/insights" element={<ProtectedPage><Insights /></ProtectedPage>} />
            <Route path="/news" element={<ProtectedPage><News /></ProtectedPage>} />
            <Route path="/stock-picks" element={<ProtectedPage><StockPicks /></ProtectedPage>} />
            <Route path="/help" element={<Navigate to="/settings" replace state={{ tab: "help" }} />} />
            <Route path="/feedback" element={<Navigate to="/settings" replace state={{ tab: "feedback" }} />} />
            <Route path="/budget" element={<ProtectedPage><Budget /></ProtectedPage>} />
            <Route path="/spending-history" element={<ProtectedPage><SpendingHistory /></ProtectedPage>} />
            <Route path="/install" element={<Install />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PublicUserProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
