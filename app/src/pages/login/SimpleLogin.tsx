import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SimpleLoginProps {
  onLogin: (username: string) => void;
}

export default function SimpleLogin({ onLogin }: SimpleLoginProps) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple validation: any username with password "test1234"
    if (password === 'test1234') {
      // Store auth in localStorage
      localStorage.setItem(
        'marketplace_auth',
        JSON.stringify({
          username,
          authenticated: true,
          timestamp: Date.now(),
        }),
      );

      onLogin(username);

      // Navigate based on username
      if (username.toLowerCase().includes('admin')) {
        navigate('/admin');
      } else if (username.toLowerCase().includes('seller')) {
        navigate('/seller');
      } else {
        navigate('/store');
      }
    } else {
      setError('Invalid credentials. Password must be "test1234"');
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          border: '1px solid #4b5563',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '8px',
            }}
          >
            🛒 Calimero Marketplace
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Sign in to access your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                color: '#e5e7eb',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #4b5563',
                background: '#111827',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.target.style.borderColor = '#4b5563')}
            />
            <p
              style={{
                color: '#9ca3af',
                fontSize: '12px',
                marginTop: '4px',
              }}
            >
              Try: admin, seller, or buyer
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                color: '#e5e7eb',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #4b5563',
                background: '#111827',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.target.style.borderColor = '#4b5563')}
            />
            <p
              style={{
                color: '#9ca3af',
                fontSize: '12px',
                marginTop: '4px',
              }}
            >
              Password: test1234
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                marginBottom: '20px',
              }}
            >
              <p style={{ color: '#ef4444', fontSize: '14px', margin: 0 }}>
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: loading
                ? '#4b5563'
                : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow =
                  '0 6px 12px -3px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 4px 6px -1px rgba(59, 130, 246, 0.3)';
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            borderRadius: '8px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          <p
            style={{
              color: '#93c5fd',
              fontSize: '13px',
              margin: 0,
              lineHeight: '1.5',
            }}
          >
            <strong>Demo Credentials:</strong>
            <br />
            Username: any (admin/seller/buyer)
            <br />
            Password: test1234
          </p>
        </div>
      </div>
    </div>
  );
}
