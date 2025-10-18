"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

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

export default function MyOrders() {
  const router = useRouter();
  const { context } = useMiniKit();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // TODO: Update this ID after running `pnpm network:bootstrap`
  const MARKETPLACE_CONTEXT_ID = process.env.NEXT_PUBLIC_MARKETPLACE_CONTEXT_ID || 'QsUM9fLnnDcHR7eA28mnpMZXaZvAbYtzqje8opb3QcQ';
  const BUYER_WALLET = '0xBuyerWallet001'; // Demo wallet

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load products
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
            executorPublicKey: 'J4r3jAQRPm8xc4TAV4hDVCd1UAvDekGMa9MKrcUg8KDs'
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
            executorPublicKey: 'J4r3jAQRPm8xc4TAV4hDVCd1UAvDekGMa9MKrcUg8KDs'
          }
        })
      });

      const ordersData = await ordersResponse.json();
      if (ordersData.result?.output) {
        const ordersJson = ordersData.result.output;
        const allOrders: Order[] = Object.values(JSON.parse(ordersJson));
        setOrders(allOrders.filter(o => o.buyer_wallet === BUYER_WALLET));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEscrowStatus = (status: any): string => {
    if (status.Pending !== undefined) return 'Pending';
    if (status.Released !== undefined) return 'Released';
    if (status.Refunded !== undefined) return 'Refunded';
    return 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Released':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    const product = products.find(p => p.id === selectedOrder.product_id);
    const status = getEscrowStatus(selectedOrder.escrow_status);

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Orders
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Order Details</h1>
              <div className="w-5"></div> {/* Spacer */}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {product?.name || 'Product'}
                </h2>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Order ID: {selectedOrder.id}</p>
                  <p>Amount: ${selectedOrder.amount}</p>
                  <p>Ordered: {new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                {status}
              </span>
            </div>

            {status === 'Pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">📦 Delivery Confirmation</h3>
                <p className="text-yellow-700 mb-4">
                  When you receive your order, confirm delivery to release the escrow payment to the seller.
                </p>
                
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">QR Payload:</p>
                  <p className="text-xs font-mono text-blue-600 break-all">
                    {selectedOrder.qr_payload}
                  </p>
                </div>

                <div className="text-center py-8 bg-white rounded-lg mb-4">
                  <div className="text-6xl mb-2">📱</div>
                  <p className="text-gray-600">QR Code for delivery confirmation</p>
                </div>

                <button
                  onClick={() => {
                    alert('Delivery confirmed! Escrow released to seller.');
                    setSelectedOrder(null);
                    loadData();
                  }}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  ✓ Confirm Delivery (Release Escrow)
                </button>
              </div>
            )}

            {status === 'Released' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Delivery Confirmed!</h3>
                <p className="text-green-700">
                  Escrow released on {selectedOrder.delivered_at ? new Date(selectedOrder.delivered_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900">My Orders</h1>
            <div className="w-5"></div> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
            <button
              onClick={() => router.push('/marketplace/browse')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const product = products.find(p => p.id === order.product_id);
              const status = getEscrowStatus(order.escrow_status);
              
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-blue-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {product?.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-2xl">📦</div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {product?.name || order.product_id}
                        </h3>
                        <p className="text-sm text-gray-600">${order.amount}</p>
                        <p className="text-xs text-gray-500">
                          Ordered: {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
