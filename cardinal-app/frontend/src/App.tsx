import { HashRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ArchitecturePage from './pages/ArchitecturePage';
import PipelinePage from './pages/PipelinePage';
import PlantsPage from './pages/PlantsPage';
import RetailersPage from './pages/RetailersPage';
import DemandPage from './pages/DemandPage';
import TradePromoPage from './pages/TradePromoPage';
import CustomersPage from './pages/CustomersPage';
import ESGPage from './pages/ESGPage';
import PolicyPage from './pages/PolicyPage';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="/plants" element={<PlantsPage />} />
            <Route path="/retailers" element={<RetailersPage />} />
            <Route path="/demand" element={<DemandPage />} />
            <Route path="/trade" element={<TradePromoPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/esg" element={<ESGPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
}
