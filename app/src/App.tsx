import React, { useState } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { CalimeroProvider, AppMode } from '@calimero-network/calimero-client';
import { ToastProvider } from '@calimero-network/mero-ui';

import Authenticate from './pages/login/Authenticate';
import MarketplaceHome from './pages/marketplace/MarketplaceHome';
import AdminDashboard from './pages/marketplace/AdminDashboard';
import OwnerDashboard from './pages/marketplace/OwnerDashboard';
import SellerDashboard from './pages/marketplace/SellerDashboard';
import BuyerMarketplace from './pages/marketplace/BuyerMarketplace';

export default function App() {
  const [clientAppId] = useState<string>(
    '3ENGFBV9bHrwpxMMPFXraRnL7bgp9gfKC7vHwcBBunBP',
  );

  return (
    <CalimeroProvider
      clientApplicationId={clientAppId}
      applicationPath={window.location.pathname || '/'}
      mode={AppMode.MultiContext}
    >
      <ToastProvider>
        <BrowserRouter basename="/">
          <Routes>
            <Route path="/" element={<Authenticate />} />
            <Route path="/marketplace" element={<MarketplaceHome />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/buyer" element={<BuyerMarketplace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </CalimeroProvider>
  );
}
