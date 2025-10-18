"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMiniKit } from '@coinbase/onchainkit/minikit';

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

interface ProductDetailProps {
  params: {
    id: string;
  };
}

export default function ProductDetail({ params }: ProductDetailProps) {
  const router = useRouter();
  const { context } = useMiniKit();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  // TODO: Update this ID after running `pnpm network:bootstrap`
  const MARKETPLACE_CONTEXT_ID = process.env.NEXT_PUBLIC_MARKETPLACE_CONTEXT_ID || 'QsUM9fLnnDcHR7eA28mnpMZXaZvAbYtzqje8opb3QcQ';

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:2528/jsonrpc', {
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

      const data = await response.json();
      if (data.result?.output) {
        const productsJson = data.result.output;
        const products: Product[] = Object.values(JSON.parse(productsJson));
        const foundProduct = products.find(p => p.id === params.id);
        setProduct(foundProduct || null);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!product) return;
    
    setPurchasing(true);
    try {
      // TODO: Implement actual purchase logic with Calimero network
      alert(`Purchase initiated for ${product.name} at $${product.price}`);
      router.push('/marketplace/orders');
    } catch (error) {
      console.error('Error purchasing product:', error);
      alert('Error purchasing product. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Product not found</h3>
          <p className="text-gray-600 mb-4">This product may have been removed or doesn't exist.</p>
          <button
            onClick={() => router.push('/marketplace/browse')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </button>
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
            <h1 className="text-xl font-semibold text-gray-900">Product Details</h1>
            <div className="w-5"></div> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Product Image */}
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-8xl text-gray-400">📦</div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                  <span>{product.quantity} available</span>
                  <span>Listed {new Date(product.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">${product.price}</div>
                <div className="text-sm text-gray-500">{product.shipping_info}</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Seller Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Seller Information</h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">S</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Seller ID: {product.seller_id}</p>
                  <p className="text-sm text-gray-600">Verified Seller</p>
                </div>
              </div>
            </div>

            {/* Purchase Button */}
            <div className="border-t pt-6">
              {product.quantity > 0 ? (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {purchasing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Buy Now - $${product.price}`
                  )}
                </button>
              ) : (
                <div className="w-full bg-gray-300 text-gray-600 py-3 px-6 rounded-lg font-semibold text-center">
                  Out of Stock
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
