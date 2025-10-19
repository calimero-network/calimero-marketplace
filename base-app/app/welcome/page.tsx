'use client';

import { useState, useEffect } from 'react';
import { useQuickAuth, useMiniKit } from '@coinbase/onchainkit/minikit';
import { useRouter } from 'next/navigation';

interface AuthResponse {
  success: boolean;
  user?: {
    fid: number;
    issuedAt?: number;
    expiresAt?: number;
  };
  message?: string;
}

export default function WelcomePage() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize the miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Use QuickAuth to verify user identity
  const { data: authData, isLoading: isAuthLoading, error: authError } = useQuickAuth<AuthResponse>(
    "/api/auth",
    { method: "GET" }
  );

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (authData?.success && authData.user) {
      // Store authentication data in the same format as AuthContext
      const fid = authData.user.fid.toString();
      const authDataStorage = {
        address: fid,
        timestamp: Date.now()
      };
      localStorage.setItem('calimero-auth', JSON.stringify(authDataStorage));
      
      // Redirect to marketplace
      router.push('/marketplace');
    }
  }, [authData, router]);

  const handleAuth = async () => {
    setError(null);
    
    // Check authentication status
    if (isAuthLoading) {
      setError("Please wait while we verify your identity...");
      return;
    }

    if (authError || !authData?.success) {
      setError("Authentication failed. Please try again.");
      return;
    }

    if (!authData.user) {
      setError("No user data received from authentication.");
      return;
    }

    // User is authenticated, redirect will happen in useEffect
    console.log("User authenticated:", authData.user);
  };

  // Show authenticated state
  if (authData?.success && authData.user) {
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
                {authData.user.fid}
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
              onClick={handleAuth}
              disabled={isAuthLoading}
              style={{
                width: '100%',
                backgroundColor: isAuthLoading ? '#93c5fd' : '#2563eb',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '16px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isAuthLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isAuthLoading ? 'Authenticating...' : 'Sign In with Farcaster'}
            </button>

            {isAuthLoading && (
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