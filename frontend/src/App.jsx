import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./components/layout/Navbar";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import StockDetail from "./pages/StockDetail";
import Rankings from "./pages/Rankings";
import Sectors from "./pages/Sectors";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 1,
    },
  },
});

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/dashboard"
            element={<AppLayout><Dashboard /></AppLayout>}
          />
          <Route
            path="/stock/:ticker"
            element={<AppLayout><StockDetail /></AppLayout>}
          />
          <Route
            path="/rankings"
            element={<AppLayout><Rankings /></AppLayout>}
          />
          <Route
            path="/sectors"
            element={<AppLayout><Sectors /></AppLayout>}
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
