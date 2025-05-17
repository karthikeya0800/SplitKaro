import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { persistor, store } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";

const App = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </PersistGate>
  </Provider>
);

export default App;
