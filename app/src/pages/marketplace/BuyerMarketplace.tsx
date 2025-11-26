import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalimero } from '@calimero-network/calimero-client';
import { useToast } from '@calimero-network/mero-ui';
import { AbiClient } from '../../api/AbiClient';

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

export default function BuyerMarketplace() {
  const navigate = useNavigate();
  const { app } = useCalimero();
  const { show } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [buyerWallet] = useState('0xBuyerWallet001');

  // Updated with bootstrap output: context_id
  const MARKETPLACE_CONTEXT_ID = '4RWh1d8R7ksxZCACdkQ1qT457tPHaYgw1zsmRSuy7LPX';

  useEffect(() => {
    // Load data regardless of auth state for demo purposes
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Direct API call without authentication (for demo)
      const productsResponse = await fetch('http://localhost:2528/jsonrpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: 'execute',
          params: {
            contextId: MARKETPLACE_CONTEXT_ID,
            method: 'get_products',
            argsJson: {},
            executorPublicKey: '33fir1baFPv6Z3vXZAZDSKZYLt9SRQaU6KXwPQPEZMMf'
          }
        })
      });

      const productsData = await productsResponse.json();
      if (productsData.result?.output) {
        const productsJson = productsData.result.output;
        setProducts(Object.values(JSON.parse(productsJson)));
      }

      // Load orders
      const ordersResponse = await fetch('http://localhost:2528/jsonrpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '2',
          method: 'execute',
          params: {
            contextId: MARKETPLACE_CONTEXT_ID,
            method: 'get_orders',
            argsJson: {},
            executorPublicKey: '33fir1baFPv6Z3vXZAZDSKZYLt9SRQaU6KXwPQPEZMMf'
          }
        })
      });

      const ordersData = await ordersResponse.json();
      if (ordersData.result?.output) {
        const ordersJson = ordersData.result.output;
        const allOrders: Order[] = Object.values(JSON.parse(ordersJson));
        setOrders(allOrders.filter(o => o.buyer_wallet === buyerWallet));
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseProduct = async (productId: string, price: string) => {
    try {
      if (!app) {
        show({ title: 'Please connect your wallet first.', variant: 'warning' });
        return;
      }

      const contexts = await app.fetchContexts();
      const marketplaceContext = contexts.find(c => c.id === MARKETPLACE_CONTEXT_ID);
      if (!marketplaceContext) {
        show({ title: 'Marketplace context not found. Please ensure the network is bootstrapped correctly.', variant: 'error' });
        return;
      }

      const api = new AbiClient(app, marketplaceContext);

      const orderId = await api.purchaseProduct({
        product_id: productId,
        buyer_wallet: buyerWallet,
        amount: price,
        _signature: `0xSig_purchase_${Date.now()}`,
      });

      show({ title: `Purchase successful! Order ID: ${orderId}. Escrow created for $${price}`, variant: 'success' });
      await loadData();
    } catch (error) {
      console.error('Error purchasing product:', error);
      show({ title: 'Error purchasing product. See console for details.', variant: 'error' });
    }
  };

  const confirmDelivery = async (orderId: string) => {
    try {
      if (!app) {
        show({ title: 'Please connect your wallet first.', variant: 'warning' });
        return;
      }

      const contexts = await app.fetchContexts();
      const marketplaceContext = contexts.find(c => c.id === MARKETPLACE_CONTEXT_ID);
      if (!marketplaceContext) {
        show({ title: 'Marketplace context not found. Please ensure the network is bootstrapped correctly.', variant: 'error' });
        return;
      }

      const api = new AbiClient(app, marketplaceContext);

      await api.confirmDelivery({
        order_id: orderId,
        _buyer_signature: `0xSig_delivery_${Date.now()}`,
      });

      show({ title: 'Delivery confirmed! Escrow has been released to the seller.', variant: 'success' });
      await loadData();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error confirming delivery:', error);
      show({ title: 'Error confirming delivery. See console for details.', variant: 'error' });
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

  if (selectedOrder) {
    const product = products.find(p => p.id === selectedOrder.product_id);
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        <button
          onClick={() => setSelectedOrder(null)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '24px',
          }}
        >
          ← Back to Orders
        </button>

        <div style={{ padding: '32px', border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#fff' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '24px' }}>Order Details</h2>

          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{product?.name || 'Product'}</h3>
            <p style={{ color: '#666' }}>Order ID: {selectedOrder.id}</p>
            <p style={{ color: '#666' }}>Amount: ${selectedOrder.amount}</p>
            <p style={{ color: '#666' }}>
              Status:{' '}
              <span style={{
                fontWeight: 'bold',
                color: getEscrowStatus(selectedOrder.escrow_status) === 'Released' ? '#10b981' : '#f59e0b'
              }}>
                {getEscrowStatus(selectedOrder.escrow_status)}
              </span>
            </p>
            <p style={{ color: '#999', fontSize: '14px', marginTop: '8px' }}>
              Ordered: {new Date(selectedOrder.created_at).toLocaleString()}
            </p>
          </div>

          {getEscrowStatus(selectedOrder.escrow_status) === 'Pending' && (
            <>
              <div style={{ padding: '24px', backgroundColor: '#f0fdf4', borderRadius: '8px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>📦 Delivery Confirmation</h3>
                <p style={{ color: '#666', marginBottom: '16px' }}>
                  When you receive your order, scan the QR code or use the link below to confirm delivery.
                  This will release the escrow payment to the seller.
                </p>

                <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '6px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    <strong>QR Payload (Delivery Confirmation Link):</strong>
                  </p>
                  <p style={{ fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all', color: '#4f46e5' }}>
                    {selectedOrder.qr_payload}
                  </p>
                </div>

                <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '128px' }}>📱</div>
                  <p style={{ color: '#666' }}>QR Code would be displayed here</p>
                </div>
              </div>

              <button
                onClick={() => confirmDelivery(selectedOrder.id)}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                }}
              >
                ✓ Confirm Delivery (Release Escrow)
              </button>
            </>
          )}

          {getEscrowStatus(selectedOrder.escrow_status) === 'Released' && (
            <div style={{ padding: '24px', backgroundColor: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
              <h3 style={{ fontSize: '20px', color: '#10b981', marginBottom: '8px' }}>
                Delivery Confirmed!
              </h3>
              <p style={{ color: '#666' }}>
                Escrow released on {selectedOrder.delivered_at ? new Date(selectedOrder.delivered_at).toLocaleString() : 'N/A'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>🛍️ Buyer Marketplace</h1>
          <p style={{ color: '#666' }}>Wallet: {buyerWallet}</p>
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

      {/* My Orders */}
      {orders.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>My Orders ({orders.length})</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {orders.map((order) => {
              const product = products.find(p => p.id === order.product_id);
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  style={{
                    padding: '20px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{product?.name || order.product_id}</h3>
                      <p style={{ color: '#666', fontSize: '14px' }}>Amount: ${order.amount}</p>
                      <p style={{ color: '#999', fontSize: '12px' }}>
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
      )}

      {/* Products */}
      <div>
        <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Browse Products</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {products.filter(p => p.quantity > 0).map((product) => (
            <div key={product.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
              <div style={{ height: '200px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '48px' }}>📦</span>
              </div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{product.name}</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px', lineHeight: '1.4' }}>
                  {product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description}
                </p>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>${product.price}</span>
                  <span style={{ fontSize: '14px', color: '#666', marginLeft: '12px' }}>
                    {product.quantity} available
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '12px' }}>
                  {product.shipping_info}
                </div>
                <button
                  onClick={() => purchaseProduct(product.id, product.price)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Buy Now
                </button>
              </div>
            </div>
          ))}
        </div>
        {products.filter(p => p.quantity > 0).length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>No products available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
