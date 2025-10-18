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
import TestInventory from './pages/marketplace/TestInventory';

export default function App() {
  const [clientAppId] = useState<string>(
    'BNL3n4b5oxe4X94SgNCFFNPgHxQVMRzdzRb2Dj2XvqgV',
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
            <Route path="/test" element={<TestInventory />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </CalimeroProvider>
  );
}
