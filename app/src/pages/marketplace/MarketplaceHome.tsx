import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MarketplaceHome() {
  const navigate = useNavigate();

  const roles = [
    {
      title: 'Admin',
      description: 'Approve seller registrations and manage marketplace settings',
      path: '/admin',
      icon: '👨‍💼',
    },
    {
      title: 'Seller',
      description: 'Register as a seller, add products, and manage your inventory',
      path: '/seller',
      icon: '🛒',
    },
    {
      title: 'Store',
      description: 'Browse products, make purchases, and track your orders',
      path: '/store',
      icon: '🛍️',
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>
          Calimero Marketplace
        </h1>
        <p style={{ fontSize: '20px', color: '#666' }}>
          Decentralized Multi-Stakeholder Marketplace
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}
      >
        {roles.map((role) => (
          <div
            key={role.path}
            onClick={() => navigate(role.path)}
            style={{
              padding: '32px',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: '#fff',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#4f46e5';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>
              {role.icon}
            </div>
            <h2 style={{ fontSize: '24px', marginBottom: '12px', textAlign: 'center' }}>
              {role.title}
            </h2>
            <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.5', textAlign: 'center' }}>
              {role.description}
            </p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '60px', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Getting Started</h3>
        <p style={{ lineHeight: '1.8', color: '#666', marginBottom: '16px' }}>
          Select your role above to access the appropriate dashboard
        </p>
        <div style={{ lineHeight: '1.8', color: '#666' }}>
          <strong>Demo Data Includes:</strong>
          <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
            <li><strong>Marketplace:</strong> TechGadgets Electronics Marketplace (Electronics & Accessories)</li>
            <li><strong>Admin:</strong> Wallet 0xAdminWallet123456789</li>
            <li><strong>Approved Seller:</strong> TechSupplies Inc (0xSellerWallet001)</li>
            <li><strong>Pending Seller:</strong> SmartHome Solutions (0xSellerWallet002) - waiting for admin approval</li>
            <li><strong>3 Products:</strong> Wireless Gaming Mouse, USB-C Hub, RGB Mechanical Keyboard</li>
            <li><strong>1 Order:</strong> Pending delivery confirmation (Buyer: 0xBuyerWallet001)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
