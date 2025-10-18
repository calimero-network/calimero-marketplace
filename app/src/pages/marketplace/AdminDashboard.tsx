import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalimeroContext, CalimeroApp } from '@calimero-network/calimero-client';
import { AbiClient } from '../../api/AbiClient';

interface MarketplaceRequest {
  id: string;
  owner_wallet: string;
  store_name: string;
  type_of_goods: string;
  signature: string;
  timestamp: number;
  approved: boolean;
}

interface MarketplaceInfo {
  id: string;
  owner_wallet: string;
  store_name: string;
  type_of_goods: string;
  context_id: string;
  created_at: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState<MarketplaceRequest[]>([]);
  const [allMarketplaces, setAllMarketplaces] = useState<MarketplaceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminAddress, setAdminAddress] = useState('');

  // TODO: Update this ID after running `pnpm network:bootstrap`
  // Look for "manager_context_id" in the bootstrap output
  const CONTEXT_MANAGER_ID = '6gVrzgJgUiNgLEvXRYLRzsJQxKraaDBkYAydGvDJ2j3v';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get the CalimeroApp instance
      const app = (window as any).calimeroApp as CalimeroApp;
      if (!app) {
        console.error('CalimeroApp not initialized');
        return;
      }

      // Get contexts and create API client for Context Manager
      const contexts = await app.fetchContexts();
      const managerContext = contexts.find(c => c.id === CONTEXT_MANAGER_ID);

      if (!managerContext) {
        console.error('Context Manager context not found');
        return;
      }

      const api = new AbiClient(app, managerContext);

      // Fetch admin address
      const adminAddr = await api.getAdminAddress();
      setAdminAddress(adminAddr);

      // Fetch pending requests
      const requestsJson = await api.getPendingRequests();
      const requests = JSON.parse(requestsJson);
      setPendingRequests(Object.values(requests));

      // Fetch all marketplaces
      const marketplacesJson = await api.getAllMarketplaces();
      const marketplaces = JSON.parse(marketplacesJson);
      setAllMarketplaces(Object.values(marketplaces));

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveMarketplace = async (requestId: string) => {
    try {
      const app = (window as any).calimeroApp as CalimeroApp;
      const contexts = await app.fetchContexts();
      const managerContext = contexts.find(c => c.id === CONTEXT_MANAGER_ID);

      if (!managerContext) return;

      const api = new AbiClient(app, managerContext);

      // In a real implementation, you would:
      // 1. Create a new context for this marketplace
      // 2. Pass that context ID to admin_approve_marketplace
      // For demo purposes, we'll use a placeholder
      const newContextId = `marketplace_context_${Date.now()}`;

      await api.adminApproveMarketplace({
        request_id: requestId,
        context_id: newContextId,
      });

      // Reload data
      await loadData();
      alert('Marketplace approved successfully!');
    } catch (error) {
      console.error('Error approving marketplace:', error);
      alert('Error approving marketplace. See console for details.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>👨‍💼 Admin Dashboard</h1>
          <p style={{ color: '#666' }}>Admin: {adminAddress}</p>
        </div>
        <button
          onClick={() => navigate('/marketplace')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          ← Back to Home
        </button>
      </div>

      {/* Pending Requests */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
          Pending Marketplace Requests ({pendingRequests.length})
        </h2>
        {pendingRequests.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <p style={{ color: '#666' }}>No pending marketplace requests</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                style={{
                  padding: '24px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{request.store_name}</h3>
                    <p style={{ color: '#666', marginBottom: '4px' }}>
                      <strong>Type:</strong> {request.type_of_goods}
                    </p>
                    <p style={{ color: '#666', marginBottom: '4px' }}>
                      <strong>Owner:</strong> {request.owner_wallet}
                    </p>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      <strong>Request ID:</strong> {request.id}
                    </p>
                    <p style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
                      Submitted: {new Date(request.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => approveMarketplace(request.id)}
                    style={{
                      padding: '10px 24px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    ✓ Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Marketplaces */}
      <div>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
          Active Marketplaces ({allMarketplaces.length})
        </h2>
        {allMarketplaces.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <p style={{ color: '#666' }}>No active marketplaces</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {allMarketplaces.map((marketplace) => (
              <div
                key={marketplace.id}
                style={{
                  padding: '24px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{marketplace.store_name}</h3>
                    <p style={{ color: '#666', marginBottom: '4px' }}>
                      <strong>Type:</strong> {marketplace.type_of_goods}
                    </p>
                    <p style={{ color: '#666', marginBottom: '4px' }}>
                      <strong>Owner:</strong> {marketplace.owner_wallet}
                    </p>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      <strong>Marketplace ID:</strong> {marketplace.id}
                    </p>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                      <strong>Context ID:</strong> {marketplace.context_id}
                    </p>
                    <p style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
                      Created: {new Date(marketplace.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: '6px 16px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    ✓ Active
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
