import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Countries from "./pages/Countries";
import About from "./pages/About";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import StartStudy from "./pages/StartStudy";
import ContactExpert from "./pages/ContactExpert";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import ClientLayout from "./components/ClientLayout";
import Dashboard from "./pages/client/Dashboard";
import Orders from "./pages/client/Orders";
import Reports from "./pages/client/Reports";
import Advice from "./pages/client/Advice";
import History from "./pages/client/History";
import IntervenantLayout from "./components/IntervenantLayout";
import IntervenantDashboard from "./pages/intervenant/Dashboard";
import IntervenantMissions from "./pages/intervenant/Missions";
import IntervenantReports from "./pages/intervenant/Reports";
import IntervenantMessages from "./pages/intervenant/Messages";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProjects from "@/pages/admin/Projects";
import AdminAccounts from "@/pages/admin/Accounts";
import AdminReports from "@/pages/admin/Reports";
import AdminStatistics from "@/pages/admin/Statistics";
import AdminTranslations from "@/pages/admin/Translations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/countries" element={<Countries />} />
            <Route path="/about" element={<About />} />
            <Route path="/start-study" element={<StartStudy />} />
            <Route path="/contact-expert" element={<ContactExpert />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            {/* Client Space Routes */}
            <Route path="/client" element={<ClientLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="reports" element={<Reports />} />
              <Route path="advice" element={<Advice />} />
              <Route path="history" element={<History />} />
            </Route>
            
            {/* Intervenant Space Routes */}
            <Route path="/intervenant" element={<IntervenantLayout />}>
              <Route path="dashboard" element={<IntervenantDashboard />} />
              <Route path="missions" element={<IntervenantMissions />} />
              <Route path="reports" element={<IntervenantReports />} />
              <Route path="messages" element={<IntervenantMessages />} />
            </Route>
            
            {/* Admin Space Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="accounts" element={<AdminAccounts />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="statistics" element={<AdminStatistics />} />
              <Route path="translations" element={<AdminTranslations />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
