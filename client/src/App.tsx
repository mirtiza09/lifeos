import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Health from "@/pages/Health";
import Career from "@/pages/Career";
import Finances from "@/pages/Finances";
import Personal from "@/pages/Personal";
import Analytics from "@/pages/Analytics";
import CategoryPage from "@/pages/CategoryPage";
import NetworkStatusBar from "@/components/NetworkStatusBar";
import { SettingsProvider } from "@/lib/settingsContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/health" component={Health} />
      <Route path="/career" component={Career} />
      <Route path="/finances" component={Finances} />
      <Route path="/personal" component={Personal} />
      <Route path="/analytics" component={Analytics} />
      {/* Dynamic route for custom categories */}
      <Route path="/:category" component={CategoryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  return (
    <>
      <Router />
      <NetworkStatusBar />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <AppContent />
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
