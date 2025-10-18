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

export default function BrowseProducts() {
  const router = useRouter();
  const { context: _context } = useMiniKit();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // TODO: Update this ID after running `pnpm network:bootstrap`
  const MARKETPLACE_CONTEXT_ID = process.env.NEXT_PUBLIC_MARKETPLACE_CONTEXT_ID || 'QsUM9fLnnDcHR7eA28mnpMZXaZvAbYtzqje8opb3QcQ';

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Clothing', label: 'Clothing' },
    { value: 'Home & Garden', label: 'Home & Garden' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Books', label: 'Books' },
    { value: 'Other', label: 'Other' },
  ];

  const loadProducts = useCallback(async () => {
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
        const prods: Product[] = Object.values(JSON.parse(productsJson));
        setProducts(prods);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }, [MARKETPLACE_CONTEXT_ID]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = products
    .filter(product => product.quantity > 0)
    .filter(product => 
      searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(product => 
      selectedCategory === 'all' || 
      product.category === selectedCategory
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'newest':
          return b.created_at - a.created_at;
        case 'oldest':
          return a.created_at - b.created_at;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
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
            <h1 className="text-xl font-semibold text-gray-900">Browse Products</h1>
            <div className="w-5"></div> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Wallapop-style Search */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-base bg-gray-50 rounded-3xl border-0 focus:ring-0 focus:outline-none"
            />
            <svg className="absolute left-4 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Wallapop-style Categories */}
        <div className="mb-4">
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-150 ${
                  selectedCategory === category.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Wallapop-style Sort */}
        <div className="mb-4 flex justify-between items-center">
          <span className="text-sm text-gray-600">{filteredProducts.length} items</span>
          <div className="flex space-x-2">
            {[
              { value: 'newest', label: 'Newest' },
              { value: 'price-low', label: 'Price ↑' },
              { value: 'price-high', label: 'Price ↓' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
                  sortBy === option.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Wallapop-style Products Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => router.push(`/marketplace/product/${product.id}`)}
              className="bg-white rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-all duration-150"
            >
              {/* Product Image - Wallapop style */}
              <div className="aspect-square bg-gray-100 relative">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-4xl text-gray-300">📦</div>
                  </div>
                )}
                {/* Heart icon like Wallapop */}
                <button className="absolute top-2 right-2 p-1 bg-white bg-opacity-80 rounded-full">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Product Info - Wallapop style */}
              <div className="p-3">
                <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2 leading-tight">
                  {product.name}
                </h3>
                
                <div className="flex items-center justify-between mb-1">
                  <span className="text-base font-bold text-gray-900">
                    ${product.price}
                  </span>
                  <span className="text-xs text-gray-500">
                    {product.quantity} left
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="truncate">{product.category}</span>
                  <span>•</span>
                  <span>Local</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Products */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No products available at the moment'
              }
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
