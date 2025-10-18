import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalimeroApp } from '@calimero-network/calimero-client';
import { AbiClient } from '../../api/AbiClient';

interface SellerRequest {
  id: string;
  wallet_address: string;
  company_name: string;
  company_details: string;
  timestamp: number;
  approved: boolean;
}

interface SellerInfo {
  id: string;
  wallet_address: string;
  company_name: string;
  company_details: string;
  approved_at: number;
}

interface Product {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  quantity: number;
  price: string;
  image_url: string;
  category: string;
  shipping_info: string;
  created_at: number;
}

interface Order {
  id: string;
  buyer_wallet: string;
  product_id: string;
  seller_id: string;
  amount: string;
  escrow_status: { Pending?: null; Released?: null; Refunded?: null };
  qr_payload: string;
  created_at: number;
  delivered_at?: number;
}

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [pendingSellerRequests, setPendingSellerRequests] = useState<SellerRequest[]>([]);
  const [approvedSellers, setApprovedSellers] = useState<SellerInfo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerWallet, setOwnerWallet] = useState('');
  const [marketplaceId, setMarketplaceId] = useState('');

  // TODO: Update this ID after running `pnpm network:bootstrap`
  // Look for "marketplace_context_id" in the bootstrap output
  const MARKETPLACE_CONTEXT_ID = 'AYZCubjAactLnudYYUC2xCzkoD14eCZPw6PThxRJuGVM';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const app = (window as any).calimeroApp as CalimeroApp;
      if (!app) return;

      const contexts = await app.fetchContexts();
      const marketplaceContext = contexts.find(c => c.id === MARKETPLACE_CONTEXT_ID);
      if (!marketplaceContext) return;

      const api = new AbiClient(app, marketplaceContext);

      // Fetch marketplace info
      const owner = await api.getOwnerWallet();
      setOwnerWallet(owner);
      const mId = await api.getMarketplaceId();
      setMarketplaceId(mId);

      // Fetch pending seller requests
      const pendingJson = await api.getPendingSellerRequests();
      const pending = JSON.parse(pendingJson);
      setPendingSellerRequests(Object.values(pending));

      // Fetch approved sellers
      const sellersJson = await api.getSellers();
      const sellers = JSON.parse(sellersJson);
      setApprovedSellers(Object.values(sellers));

      // Fetch products
      const productsJson = await api.getProducts();
      const prods = JSON.parse(productsJson);
      setProducts(Object.values(prods));

      // Fetch orders
      const ordersJson = await api.getOrders();
      const ords = JSON.parse(ordersJson);
      setOrders(Object.values(ords));

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveSeller = async (sellerId: string) => {
    try {
      const app = (window as any).calimeroApp as CalimeroApp;
      const contexts = await app.fetchContexts();
      const marketplaceContext = contexts.find(c => c.id === MARKETPLACE_CONTEXT_ID);
      if (!marketplaceContext) return;

      const api = new AbiClient(app, marketplaceContext);
      await api.ownerApproveSeller({ seller_id: sellerId });

      await loadData();
      alert('Seller approved successfully!');
    } catch (error) {
      console.error('Error approving seller:', error);
      alert('Error approving seller. See console for details.');
    }
  };

  const getEscrowStatus = (status: any): string => {
    if (status.Pending !== undefined) return 'Pending';
    if (status.Released !== undefined) return 'Released';
    if (status.Refunded !== undefined) return 'Refunded';
    return 'Unknown';
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}><h2>Loading...</h2></div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>🏪 Marketplace Owner Dashboard</h1>
          <p style={{ color: '#666' }}>Marketplace: {marketplaceId}</p>
          <p style={{ color: '#666', fontSize: '14px' }}>Owner: {ownerWallet}</p>
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

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'Pending Sellers', value: pendingSellerRequests.length, color: '#f59e0b' },
          { label: 'Approved Sellers', value: approvedSellers.length, color: '#10b981' },
          { label: 'Total Products', value: products.length, color: '#3b82f6' },
          { label: 'Total Orders', value: orders.length, color: '#8b5cf6' },
        ].map((stat) => (
          <div key={stat.label} style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pending Seller Requests */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
          Pending Seller Requests ({pendingSellerRequests.length})
        </h2>
        {pendingSellerRequests.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <p style={{ color: '#666' }}>No pending seller requests</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {pendingSellerRequests.map((request) => (
              <div key={request.id} style={{ padding: '24px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{request.company_name}</h3>
                    <p style={{ color: '#666', marginBottom: '8px' }}>{request.company_details}</p>
                    <p style={{ color: '#666', fontSize: '14px' }}>Wallet: {request.wallet_address}</p>
                    <p style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
                      Submitted: {new Date(request.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => approveSeller(request.id)}
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

      {/* Approved Sellers */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
          Approved Sellers ({approvedSellers.length})
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {approvedSellers.map((seller) => (
            <div key={seller.id} style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{seller.company_name}</h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>
                Wallet: {seller.wallet_address}
              </p>
              <p style={{ color: '#999', fontSize: '12px' }}>
                Approved: {new Date(seller.approved_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
          Recent Orders ({orders.length})
        </h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          {orders.slice(0, 5).map((order) => {
            const product = products.find(p => p.id === order.product_id);
            return (
              <div key={order.id} style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
                      {product?.name || order.product_id}
                    </h3>
                    <p style={{ color: '#666', fontSize: '14px' }}>Buyer: {order.buyer_wallet}</p>
                    <p style={{ color: '#666', fontSize: '14px' }}>Amount: ${order.amount}</p>
                    <p style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
                      Ordered: {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div
                    style={{
                      padding: '6px 16px',
                      backgroundColor: getEscrowStatus(order.escrow_status) === 'Released' ? '#10b981' : '#f59e0b',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    {getEscrowStatus(order.escrow_status)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
