# Base Account Authentication Setup

This application now includes Base Account authentication following the [official Base documentation](https://docs.base.org/base-account/guides/authenticate-users).

## 🚀 Features Implemented

### 1. **Welcome Page** (`/welcome`)
- Beautiful landing page with Base Account authentication
- Uses the official `SignInWithBaseButton` component
- Handles authentication flow with proper error handling
- Redirects to marketplace after successful authentication

### 2. **Authentication Endpoints**
- **`/api/auth/nonce`** - Generates secure nonces for authentication
- **`/api/auth/verify`** - Verifies JWT signatures using Viem
- **`/api/auth`** - Original Farcaster JWT endpoint (enhanced with logging)

### 3. **Authentication Context**
- Global authentication state management
- Persistent login sessions (24-hour expiry)
- Automatic logout on session expiry

### 4. **Protected Routes**
- Marketplace pages require authentication
- Automatic redirect to welcome page if not authenticated
- User address display in marketplace header

## 🔧 Setup Instructions

### 1. **Environment Variables**
Create a `.env.local` file in the `base-app` directory:

```bash
# OnchainKit API Key (required for Base Account integration)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key_here

# Application URL (for production deployment)
NEXT_PUBLIC_URL=http://localhost:3000
```

### 2. **Install Dependencies**
```bash
cd base-app
npm install
```

### 3. **Run Development Server**
```bash
npm run dev
```

### 4. **Test Authentication**
1. Navigate to `http://localhost:3000`
2. You'll be redirected to `/welcome`
3. Click "Sign in with Base" button
4. Connect your Base Account wallet
5. Sign the authentication message
6. You'll be redirected to the marketplace

## 🔍 Authentication Flow

1. **Welcome Page**: User lands on `/welcome` for authentication
2. **Nonce Generation**: Server generates a secure nonce
3. **Wallet Connection**: User connects their Base Account wallet
4. **Message Signing**: User signs an authentication message
5. **Verification**: Server verifies the signature using Viem
6. **Session Creation**: User is logged in and redirected to marketplace

## 🛡️ Security Features

- **Nonce-based Authentication**: Prevents replay attacks
- **Domain Validation**: JWT verification includes domain checking
- **Session Management**: 24-hour session expiry
- **Signature Verification**: Uses Viem for cryptographic verification
- **Error Handling**: Comprehensive error handling and logging

## 📱 User Experience

- **Responsive Design**: Works on mobile and desktop
- **Loading States**: Clear feedback during authentication
- **Error Messages**: User-friendly error handling
- **Persistent Sessions**: Users stay logged in across browser sessions
- **Logout Functionality**: Easy logout with session cleanup

## 🔧 Technical Details

### Dependencies Added
- `@base-org/account` - Base Account SDK
- `@base-org/account-ui` - Base Account UI components

### Key Components
- `WelcomePage` - Authentication landing page
- `AuthContext` - Global authentication state
- `ProtectedRoute` - Route protection wrapper
- Authentication API endpoints with comprehensive logging

### Authentication Endpoints
- `GET /api/auth/nonce` - Generate authentication nonce
- `POST /api/auth/verify` - Verify signature and authenticate
- `GET /api/auth` - Original Farcaster JWT endpoint (enhanced)

## 🚀 Deployment

For production deployment on Vercel:

1. Set environment variables in Vercel dashboard
2. Deploy with `vercel --prod`
3. Update `NEXT_PUBLIC_URL` to your production domain

## 📚 Documentation

- [Base Account Documentation](https://docs.base.org/base-account/guides/authenticate-users)
- [OnchainKit Documentation](https://docs.base.org/onchainkit/)
- [Viem Documentation](https://viem.sh/)

## 🐛 Troubleshooting

### Common Issues
1. **"Method not supported"** - User's wallet doesn't support the new authentication method
2. **"Invalid signature"** - Signature verification failed
3. **"Invalid nonce"** - Nonce has been reused or expired

### Debug Logging
All authentication requests include comprehensive logging with request IDs for easy debugging. Check the server console for detailed logs.

## 🔄 Next Steps

1. **Add User Profiles**: Store user data in database
2. **Enhanced Security**: Add rate limiting and additional security measures
3. **Multi-wallet Support**: Support for additional wallet types
4. **Session Management**: Implement refresh tokens and advanced session handling
