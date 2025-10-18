"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import Image from 'next/image';

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

export default function MyListings() {
  const router = useRouter();
  const { context: _context } = useMiniKit();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'products' | 'orders'>('products');

  // TODO: Update this ID after running `pnpm network:bootstrap`
  const MARKETPLACE_CONTEXT_ID = process.env.NEXT_PUBLIC_MARKETPLACE_CONTEXT_ID || 'QsUM9fLnnDcHR7eA28mnpMZXaZvAbYtzqje8opb3QcQ';
  const _SELLER_ID = 'current_seller'; // Demo seller ID

  const loadData = useCallback(async () => {
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
        const prods: Product[] = Object.values(JSON.parse(productsJson));
        // Filter to show only current seller's products (for demo, show all)
        setProducts(prods);
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
        // Filter orders for current seller's products
        setOrders(allOrders);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [MARKETPLACE_CONTEXT_ID]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getEscrowStatus = (status: unknown): string => {
    if (typeof status === 'object' && status !== null) {
      const statusObj = status as Record<string, unknown>;
      if (statusObj.Pending !== undefined) return 'Pending';
      if (statusObj.Released !== undefined) return 'Released';
      if (statusObj.Refunded !== undefined) return 'Refunded';
    }
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
          <p className="text-gray-600">Loading your listings...</p>
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
            <h1 className="text-xl font-semibold text-gray-900">My Listings</h1>
            <button
              onClick={() => router.push('/marketplace/sell')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              + Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setSelectedTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Products ({products.length})
              </button>
              <button
                onClick={() => setSelectedTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'orders'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sales Orders ({orders.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Products Tab */}
        {selectedTab === 'products' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products listed</h3>
                <p className="text-gray-600 mb-4">Start selling by adding your first product</p>
                <button
                  onClick={() => router.push('/marketplace/sell')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Your First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-4xl text-gray-400">📦</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-green-600">
                          ${product.price}
                        </span>
                        <span className="text-xs text-gray-500">
                          {product.quantity} left
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{product.category}</span>
                        <span>{product.shipping_info}</span>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors">
                          Edit
                        </button>
                        <button className="flex-1 px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {selectedTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No sales yet</h3>
                <p className="text-gray-600 mb-4">Your sales orders will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {orders.map((order) => {
                  const product = products.find(p => p.id === order.product_id);
                  const status = getEscrowStatus(order.escrow_status);
                  
                  return (
                    <div key={order.id} className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            {product?.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.name}
                                width={64}
                                height={64}
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
                            <p className="text-sm text-gray-600">Buyer: {order.buyer_wallet}</p>
                            <p className="text-sm text-gray-600">Amount: ${order.amount}</p>
                            <p className="text-xs text-gray-500">
                              Ordered: {new Date(order.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                            {status}
                          </span>
                          {status === 'Pending' && (
                            <p className="text-xs text-gray-500 mt-1">Waiting for delivery confirmation</p>
                          )}
                          {status === 'Released' && (
                            <p className="text-xs text-green-600 mt-1">Payment received</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
