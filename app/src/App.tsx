import React, { useState } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { CalimeroProvider, AppMode } from '@calimero-network/calimero-client';
import { ToastProvider } from '@calimero-network/mero-ui';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import SimpleLogin from './pages/login/SimpleLogin';
import MarketplaceHome from './pages/marketplace/MarketplaceHome';
import AdminDashboard from './pages/marketplace/AdminDashboard';
import SellerDashboard from './pages/marketplace/SellerDashboard';
import BuyerMarketplace from './pages/marketplace/BuyerMarketplace';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { login } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<SimpleLogin onLogin={login} />} />
      <Route path="/" element={<MarketplaceHome />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller"
        element={
          <ProtectedRoute>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store"
        element={
          <ProtectedRoute>
            <BuyerMarketplace />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  // Updated with bootstrap output: app_id
  const [clientAppId] = useState<string>(
    '3W8yWDzGUgCGEXVMRQkspcVwYZ3u8NMdxB9oDDHxd31x',
  );

  // Context ID from bootstrap: FrHTTbHBVi4zsu7grrjiTGnVH67aYmxyp2kbhybLcBtb
  // Update this in individual dashboard components

  return (
    <AuthProvider>
      <CalimeroProvider
        clientApplicationId={clientAppId}
        applicationPath={window.location.pathname || '/'}
        mode={AppMode.MultiContext}
      >
        <ToastProvider>
          <BrowserRouter basename="/">
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </CalimeroProvider>
    </AuthProvider>
  );
}
