import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalimero } from '@calimero-network/calimero-client';
import { useToast } from '@calimero-network/mero-ui';
import { useAuth } from '../../contexts/AuthContext';
import { AbiClient } from '../../api/AbiClient';

interface SellerRequest {
  id: string;
  wallet_address: string;
  company_name: string;
  company_details: string;
  signature: string;
  timestamp: number;
  approved: boolean;
}

interface MarketplaceInfo {
  admin_wallet: string;
  store_name: string;
  type_of_goods: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { app } = useCalimero();
  const { show } = useToast();
  const { user, logout } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<SellerRequest[]>([]);
  const [marketplaceInfo, setMarketplaceInfo] =
    useState<MarketplaceInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Updated with bootstrap output: context_id
  const MARKETPLACE_CONTEXT_ID = '4RWh1d8R7ksxZCACdkQ1qT457tPHaYgw1zsmRSuy7LPX';

  useEffect(() => {
    // Load real data from backend
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch marketplace info via direct JSON-RPC
      const infoResponse = await fetch('http://localhost:2528/jsonrpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: 'execute',
          params: {
            contextId: MARKETPLACE_CONTEXT_ID,
            method: 'get_marketplace_info',
            argsJson: {},
            executorPublicKey: '33fir1baFPv6Z3vXZAZDSKZYLt9SRQaU6KXwPQPEZMMf',
          },
        }),
      });

      const infoData = await infoResponse.json();
      if (infoData.result?.output) {
        setMarketplaceInfo(JSON.parse(infoData.result.output));
      }

      // Fetch pending seller requests via direct JSON-RPC
      const requestsResponse = await fetch('http://localhost:2528/jsonrpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '2',
          method: 'execute',
          params: {
            contextId: MARKETPLACE_CONTEXT_ID,
            method: 'get_pending_seller_requests',
            argsJson: {},
            executorPublicKey: '33fir1baFPv6Z3vXZAZDSKZYLt9SRQaU6KXwPQPEZMMf',
          },
        }),
      });

      const requestsData = await requestsResponse.json();
      if (requestsData.result?.output) {
        setPendingRequests(JSON.parse(requestsData.result.output));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveSeller = async (sellerId: string) => {
    try {
      // Call admin_approve_seller via direct JSON-RPC
      const response = await fetch('http://localhost:2528/jsonrpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: 'execute',
          params: {
            contextId: MARKETPLACE_CONTEXT_ID,
            method: 'admin_approve_seller',
            argsJson: { seller_id: sellerId },
            executorPublicKey: '33fir1baFPv6Z3vXZAZDSKZYLt9SRQaU6KXwPQPEZMMf',
          },
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.type || JSON.stringify(data.error));
      }

      show({ title: 'Seller approved successfully!', variant: 'success' });
      // Reload data to reflect changes
      await loadData();
    } catch (error: any) {
      console.error('Error approving seller:', error);
      show({
        title: `Failed to approve seller: ${error.message || 'Unknown error'}`,
        variant: 'error',
      });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>Admin Dashboard</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
          {user && (
            <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
              Logged in as: {user.username}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/')} style={buttonStyle}>
            Home
          </button>
          <button onClick={() => navigate('/store')} style={buttonStyle}>
            View Store
          </button>
          <button onClick={() => navigate('/seller')} style={buttonStyle}>
            Seller View
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{ ...buttonStyle, backgroundColor: '#ef4444' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Marketplace Info */}
      {marketplaceInfo && (
        <div
          style={{
            ...cardStyle,
            backgroundColor: '#e3f2fd',
            marginBottom: '30px',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Marketplace Information</h2>
          <p>
            <strong>Store Name:</strong> {marketplaceInfo.store_name}
          </p>
          <p>
            <strong>Type of Goods:</strong> {marketplaceInfo.type_of_goods}
          </p>
          <p>
            <strong>Admin Wallet:</strong>{' '}
            <code>{marketplaceInfo.admin_wallet}</code>
          </p>
        </div>
      )}

      {/* Pending Seller Requests */}
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>
          Pending Seller Requests ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <p style={{ color: '#666' }}>No pending seller requests.</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                style={{
                  ...cardStyle,
                  backgroundColor: '#fff3e0',
                  border: '1px solid #ffb74d',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#e65100' }}>
                      {request.company_name}
                    </h3>
                    <p>
                      <strong>Wallet:</strong>{' '}
                      <code>{request.wallet_address}</code>
                    </p>
                    <p>
                      <strong>Details:</strong> {request.company_details}
                    </p>
                    <p style={{ fontSize: '0.9em', color: '#666' }}>
                      <strong>Requested:</strong>{' '}
                      {new Date(request.timestamp / 1000000).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => approveSeller(request.id)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: '#4caf50',
                      color: 'white',
                      padding: '10px 20px',
                    }}
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#f5f5f5',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '20px',
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
};
