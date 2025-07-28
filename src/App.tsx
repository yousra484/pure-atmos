import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services language="fr" country="dz" onLanguageChange={() => {}} onCountryChange={() => {}} />} />
          <Route path="/countries" element={<Countries language="fr" country="dz" onLanguageChange={() => {}} onCountryChange={() => {}} />} />
          <Route path="/about" element={<About />} />
          <Route path="/start-study" element={<StartStudy />} />
          <Route path="/contact-expert" element={<ContactExpert />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login language="fr" country="dz" onLanguageChange={() => {}} onCountryChange={() => {}} />} />
          <Route path="/signup" element={<SignUp language="fr" country="dz" onLanguageChange={() => {}} onCountryChange={() => {}} />} />
          
          {/* Client Space Routes */}
          <Route path="/client" element={<ClientLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="reports" element={<Reports />} />
            <Route path="advice" element={<Advice />} />
            <Route path="history" element={<History />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
