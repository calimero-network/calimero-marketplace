import React, { useState } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { CalimeroProvider, AppMode } from '@calimero-network/calimero-client';
import { ToastProvider } from '@calimero-network/mero-ui';

import MarketplaceHome from './pages/marketplace/MarketplaceHome';
import AdminDashboard from './pages/marketplace/AdminDashboard';
import SellerDashboard from './pages/marketplace/SellerDashboard';
import BuyerMarketplace from './pages/marketplace/BuyerMarketplace';

export default function App() {
  // Updated with bootstrap output: app_id
  const [clientAppId] = useState<string>(
    '3W8yWDzGUgCGEXVMRQkspcVwYZ3u8NMdxB9oDDHxd31x',
  );

  // Context ID from bootstrap: FrHTTbHBVi4zsu7grrjiTGnVH67aYmxyp2kbhybLcBtb
  // Update this in individual dashboard components

  return (
    <CalimeroProvider
      clientApplicationId={clientAppId}
      applicationPath={window.location.pathname || '/'}
      mode={AppMode.MultiContext}
    >
      <ToastProvider>
        <BrowserRouter basename="/">
          <Routes>
            <Route path="/" element={<MarketplaceHome />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/store" element={<BuyerMarketplace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </CalimeroProvider>
  );
}
