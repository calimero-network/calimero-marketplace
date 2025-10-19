'use client';

import { useAuthenticate } from '@coinbase/onchainkit/minikit';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const { signIn } = useAuthenticate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ fid?: string } | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const router = useRouter();

  // Debug the useAuthenticate hook
  console.log('🔍 useAuthenticate hook result:', { signIn });
  console.log('🔍 signIn function:', signIn);

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (user) {
      setDebugInfo(prev => prev + `\n✅ User authenticated in useEffect: ${JSON.stringify(user)}`);
      // Store authentication data in the same format as AuthContext
      const fid = user.fid || 'unknown';
      const authData = {
        address: fid.toString(),
        timestamp: Date.now()
      };
      localStorage.setItem('calimero-auth', JSON.stringify(authData));
      setDebugInfo(prev => prev + `\n💾 Stored auth data: ${JSON.stringify(authData)}`);
      
      // DON'T redirect - just show debug info
      setDebugInfo(prev => prev + `\n🚫 Redirect disabled for debugging`);
    }
  }, [user, router]);

  const handleAuth = async () => {
    setIsAuthenticating(true);
    setError(null);
    setDebugInfo('🚀 Starting authentication...');
    
    try {
      setDebugInfo(prev => prev + '\n📞 Calling signIn()...');
      const result = await signIn();
      setDebugInfo(prev => prev + `\n🔑 SIGNIN RESULT TYPE: ${typeof result}`);
      setDebugInfo(prev => prev + `\n🔑 SIGNIN RESULT: ${JSON.stringify(result, null, 2)}`);
      
      if (result) {
        setDebugInfo(prev => prev + `\n✅ Authentication successful!`);
        setDebugInfo(prev => prev + `\n🔑 Result keys: ${Object.keys(result).join(', ')}`);
        
        // Try multiple possible FID extraction paths
        const userData = result as Record<string, unknown>;
        setDebugInfo(prev => prev + `\n🔍 userData type: ${typeof userData}`);
        setDebugInfo(prev => prev + `\n🔍 userData keys: ${Object.keys(userData).join(', ')}`);
        
        // Check all possible FID locations step by step
        setDebugInfo(prev => prev + `\n🔍 Checking userData.fid: ${userData.fid}`);
        setDebugInfo(prev => prev + `\n🔍 Checking userData.user: ${JSON.stringify(userData.user)}`);
        setDebugInfo(prev => prev + `\n🔍 Checking userData.data: ${JSON.stringify(userData.data)}`);
        setDebugInfo(prev => prev + `\n🔍 Checking userData.profile: ${JSON.stringify(userData.profile)}`);
        setDebugInfo(prev => prev + `\n🔍 Checking userData.authenticatedUser: ${JSON.stringify(userData.authenticatedUser)}`);
        
        // Check nested user object
        if (userData.user) {
          const userObj = userData.user as Record<string, unknown>;
          setDebugInfo(prev => prev + `\n🔍 userData.user keys: ${Object.keys(userObj).join(', ')}`);
          setDebugInfo(prev => prev + `\n🔍 userData.user.fid: ${userObj.fid}`);
        }
        
        // Try all possible FID paths
        const fid = userData.fid || 
                   (userData.user as Record<string, unknown>)?.fid || 
                   (userData.data as Record<string, unknown>)?.fid ||
                   (userData.profile as Record<string, unknown>)?.fid ||
                   (userData.authenticatedUser as Record<string, unknown>)?.fid ||
                   'unknown';
        
        setDebugInfo(prev => prev + `\n✅ Final FID: ${fid} (type: ${typeof fid})`);
        
        // Set the user state
        setDebugInfo(prev => prev + `\n👤 Setting user state with fid: ${fid}`);
        setUser({ fid: fid.toString() });
        
        // Store authentication data
        const authData = {
          address: fid.toString(),
          timestamp: Date.now()
        };
        localStorage.setItem('calimero-auth', JSON.stringify(authData));
        setDebugInfo(prev => prev + `\n💾 Stored auth data: ${JSON.stringify(authData)}`);
        setDebugInfo(prev => prev + `\n🎯 Authentication complete - staying on page for debugging`);
      } else {
        setDebugInfo(prev => prev + '\n❌ No result from signIn()');
        setError('No authentication result received');
      }
    } catch (error) {
      setDebugInfo(prev => prev + `\n❌ Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setError(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Show authenticated state
  if (user) {
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
                    {user.fid || 'Unknown'}
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

              {debugInfo && (
                <div style={{
                  marginBottom: '24px',
                  padding: '20px',
                  backgroundColor: '#f0f9ff',
                  border: '2px solid #0284c7',
                  borderRadius: '16px',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ flexShrink: 0 }}>
                      <svg style={{ height: '24px', width: '24px', color: '#0284c7' }} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1H9a1 1 0 110-2h1V7a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div style={{ marginLeft: '12px', flex: 1 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e40af', margin: '0 0 12px' }}>
                        🔍 Complete Debug Log
                      </h3>
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#1e40af', 
                        fontFamily: 'monospace', 
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.4',
                        backgroundColor: '#ffffff',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #bae6fd'
                      }}>
                        {debugInfo}
                      </div>
                    </div>
                  </div>
                </div>
              )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              onClick={handleAuth}
              disabled={isAuthenticating}
              style={{
                width: '100%',
                backgroundColor: isAuthenticating ? '#93c5fd' : '#2563eb',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '16px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isAuthenticating ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {isAuthenticating ? 'Authenticating...' : 'Sign In with Farcaster'}
            </button>


            {isAuthenticating && (
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