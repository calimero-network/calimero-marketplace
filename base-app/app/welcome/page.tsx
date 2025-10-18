'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userFid, setUserFid] = useState<string | null>(null);
  const router = useRouter();


  // Check authentication status on mount
  useEffect(() => {
    // Clear any existing mock tokens for clean testing
    localStorage.removeItem('calimero-auth');
    localStorage.removeItem('jwtToken');
    
    const storedAuth = localStorage.getItem('calimero-auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData.address && authData.timestamp) {
          // Check if auth is not expired (24 hours)
          const isExpired = Date.now() - authData.timestamp > 24 * 60 * 60 * 1000;
          if (!isExpired) {
            setIsAuthenticated(true);
            setUserFid(authData.address); // Use address as FID for now
            
            // Auto-redirect already authenticated users
            setTimeout(() => {
              router.push('/marketplace');
            }, 2000);
          } else {
            localStorage.removeItem('calimero-auth');
          }
        }
      } catch (error) {
        console.error('Error parsing stored auth:', error);
        localStorage.removeItem('calimero-auth');
      }
    }
  }, [router]);

  const signInWithFarcaster = async () => {
    console.log('signInWithFarcaster called - starting real Farcaster authentication');
    setIsLoading(true);
    setError(null);

    try {
      console.log('Checking if running in Farcaster context...');
      
      // Check if we're running in a Farcaster context
      if (typeof window === 'undefined') {
        throw new Error('This must run in a browser environment');
      }

      // Check for Farcaster context
      if (!window.parent || window.parent === window) {
        throw new Error('This app must be running within Farcaster to use authentication. Please open this app from within the Farcaster mobile app.');
      }

      console.log('Attempting to load Farcaster SDK...');
      
      // Dynamic import to avoid SSR issues
      const { sdk } = await import('@farcaster/miniapp-sdk');
      console.log('Farcaster SDK loaded successfully');
      
      // Check if SDK is properly initialized
      if (!sdk || !sdk.quickAuth) {
        throw new Error('Farcaster SDK not properly initialized');
      }
      
      console.log('Calling sdk.quickAuth.getToken()...');
      
      // Get JWT token from Farcaster
      const result = await sdk.quickAuth.getToken();
      console.log('getToken result:', result);
      
      if (!result || !result.token) {
        throw new Error('No token received from Farcaster');
      }
      
      const { token } = result;
      console.log('JWT token received:', token.substring(0, 20) + '...');
      console.log('🔑 FULL JWT TOKEN FOR SERVER VERIFICATION:', token);
      
      // Verify token with backend
      console.log('Verifying token with backend...');
      const response = await fetch('/api/auth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const userData = await response.json();
      console.log('Backend verification successful:', userData);
      
      // Store authentication data in the same format as AuthContext
      const fid = userData.user.fid.toString();
      const authData = {
        address: fid, // Use FID as address for now
        timestamp: Date.now()
      };
      localStorage.setItem('calimero-auth', JSON.stringify(authData));
      localStorage.setItem('jwtToken', token);
      
      setIsAuthenticated(true);
      setUserFid(fid);

      // Redirect to marketplace
      setTimeout(() => {
        router.push('/marketplace');
      }, 1000);
      
    } catch (err: unknown) {
      console.error('Farcaster authentication error:', err);
      console.error('Error details:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      
      // Provide more helpful error messages
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('Farcaster context')) {
          errorMessage = 'This app must be opened from within the Farcaster mobile app to use authentication.';
        } else if (err.message.includes('SDK not properly initialized')) {
          errorMessage = 'Farcaster SDK failed to initialize. Please try refreshing the page.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show authenticated state
  if (isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: 'white',
        fontFamily: 'system-ui, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #f3f4f6',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
                Calimero Marketplace
              </h1>
            </div>
          </div>
        </div>

        {/* Authenticated content */}
        <div style={{ padding: '32px 16px' }}>
          <div style={{ maxWidth: '448px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#dcfce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <svg style={{ width: '40px', height: '40px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 16px' }}>
              Authentication Successful!
            </h2>
            <p style={{ color: '#6b7280', margin: '0 0 32px', lineHeight: '1.5' }}>
              You&apos;re now connected to the marketplace
            </p>

            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px' }}>
                Connected FID:
              </p>
              <p style={{ 
                fontFamily: 'monospace', 
                fontSize: '14px', 
                color: '#111827', 
                wordBreak: 'break-all',
                margin: 0 
              }}>
                {userFid}
              </p>
            </div>

            <div style={{
              backgroundColor: '#dbeafe',
              borderRadius: '16px',
              padding: '16px'
            }}>
              <p style={{ fontSize: '14px', color: '#2563eb', margin: 0 }}>
                Redirecting to marketplace...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #f3f4f6',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>
              Calimero Marketplace
            </h1>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ padding: '32px 16px' }}>
        <div style={{ maxWidth: '448px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <svg style={{ width: '40px', height: '40px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 16px' }}>
              Welcome to Calimero Marketplace
            </h2>
            <p style={{ color: '#6b7280', margin: '0 0 32px', lineHeight: '1.5' }}>
              Connect with Farcaster to access the marketplace and start trading on Calimero Network
            </p>
          </div>

          {error && (
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '16px'
            }}>
              <div style={{ display: 'flex' }}>
                <div style={{ flexShrink: 0 }}>
                  <svg style={{ height: '20px', width: '20px', color: '#f87171' }} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div style={{ marginLeft: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#991b1b', margin: '0 0 8px' }}>
                    Authentication Error
                  </h3>
                  <div style={{ fontSize: '14px', color: '#b91c1c' }}>
                    <p style={{ margin: 0 }}>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              onClick={signInWithFarcaster}
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: isLoading ? '#93c5fd' : '#2563eb',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '16px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isLoading ? 'Connecting...' : 'Connect with Farcaster'}
            </button>


            {isLoading && (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#2563eb',
                  backgroundColor: '#dbeafe',
                  borderRadius: '16px'
                }}>
                  <svg style={{
                    animation: 'spin 1s linear infinite',
                    marginRight: '12px',
                    height: '20px',
                    width: '20px',
                    color: '#2563eb'
                  }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: '0.25' }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: '0.75' }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </div>
              </div>
            )}
          </div>

          {/* Marketplace Preview */}
          <div style={{ marginTop: '32px' }}>
            <div style={{
              background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
              borderRadius: '16px',
              padding: '24px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontWeight: '600', fontSize: '18px', margin: '0 0 4px' }}>
                    Start trading today
                  </h3>
                  <p style={{ fontSize: '14px', opacity: '0.9', margin: 0 }}>
                    Connect with Farcaster to access the marketplace
                  </p>
                </div>
                <div style={{ fontSize: '24px' }}>🛒</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              By connecting, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}