"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function MarketplaceHome() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* Wallapop-style Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">Marketplace</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Wallapop-style Content */}
      <div className="px-4 py-4">
        {/* Search Bar - Wallapop style */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/marketplace/browse')}
            className="w-full bg-gray-50 rounded-3xl px-4 py-3 text-left flex items-center space-x-3"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-gray-500">What are you looking for?</span>
          </button>
        </div>

        {/* Categories - Wallapop style */}
        <div className="mb-6">
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {[
              { name: 'All', icon: '🏠', active: true },
              { name: 'Electronics', icon: '📱' },
              { name: 'Fashion', icon: '👕' },
              { name: 'Home', icon: '🏡' },
              { name: 'Sports', icon: '⚽' },
              { name: 'Books', icon: '📚' },
              { name: 'Toys', icon: '🧸' }
            ].map((category) => (
              <button
                key={category.name}
                onClick={() => router.push(`/marketplace/browse?category=${category.name}`)}
                className={`flex-shrink-0 flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-150 ${
                  category.active 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="text-2xl mb-1">{category.icon}</span>
                <span className="text-xs font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions - Wallapop style */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/marketplace/sell')}
              className="bg-green-500 text-white rounded-2xl p-4 text-center"
            >
              <div className="text-2xl mb-2">➕</div>
              <div className="font-semibold text-sm">Sell something</div>
            </button>
            <button
              onClick={() => router.push('/marketplace/orders')}
              className="bg-gray-100 text-gray-700 rounded-2xl p-4 text-center"
            >
              <div className="text-2xl mb-2">📦</div>
              <div className="font-semibold text-sm">My purchases</div>
            </button>
          </div>
        </div>

        {/* Featured Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Featured</h2>
            <button className="text-blue-500 text-sm font-medium">See all</button>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Start selling today</h3>
                <p className="text-sm opacity-90">List your first item in minutes</p>
              </div>
              <button
                onClick={() => router.push('/marketplace/sell')}
                className="bg-white text-blue-500 px-4 py-2 rounded-xl font-semibold text-sm"
              >
                Get started
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Recent</h2>
            <button className="text-blue-500 text-sm font-medium">See all</button>
          </div>
          <div className="bg-gray-50 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-600 text-sm mb-1">No recent searches</p>
            <p className="text-gray-500 text-xs">Start browsing to see your activity</p>
          </div>
        </div>
      </div>
    </div>
  );
}
