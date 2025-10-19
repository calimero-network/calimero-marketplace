import { Errors, createClient } from "@farcaster/quick-auth";
import { NextRequest, NextResponse } from "next/server";

const client = createClient();

// Helper function to determine the correct domain for JWT verification
function getUrlHost(request: NextRequest): string {
  // First try to get the origin from the Origin header (most reliable for CORS requests)
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const url = new URL(origin);
      return url.host;
    } catch (error) {
      console.warn("Invalid origin header:", origin, error);
    }
  }

  // Fallback to Host header
  const host = request.headers.get("host");
  if (host) {
    return host;
  }

  // Final fallback to environment variables (your original logic)
  let urlValue: string;
  if (process.env.VERCEL_ENV === "production") {
    urlValue = process.env.NEXT_PUBLIC_URL!;
  } else if (process.env.VERCEL_URL) {
    urlValue = `https://${process.env.VERCEL_URL}`;
  } else {
    urlValue = "http://localhost:3000";
  }

  const url = new URL(urlValue);
  return url.host;
}

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] [${requestId}] JWT Auth Request Started`);
  console.log(`[${requestId}] Request URL: ${request.url}`);
  console.log(`[${requestId}] Request Method: ${request.method}`);
  console.log(`[${requestId}] User Agent: ${request.headers.get("user-agent")}`);
  console.log(`[${requestId}] Origin: ${request.headers.get("origin")}`);
  console.log(`[${requestId}] Host: ${request.headers.get("host")}`);
  
  // Because we're fetching this endpoint via `sdk.quickAuth.fetch`,
  // if we're in a mini app, the request will include the necessary `Authorization` header.
  const authorization = request.headers.get("Authorization");
  
  console.log(`[${requestId}] Authorization header present: ${!!authorization}`);
  if (authorization) {
    console.log(`[${requestId}] Authorization header length: ${authorization.length}`);
    console.log(`[${requestId}] Authorization starts with Bearer: ${authorization.startsWith("Bearer ")}`);
    // Log first 20 chars of token for debugging (don't log full token for security)
    const token = authorization.split(" ")[1];
    if (token) {
      console.log(`[${requestId}] Token preview: ${token.substring(0, 20)}...`);
      console.log(`[${requestId}] Token length: ${token.length}`);
    }
  }

  // Here we ensure that we have a valid token.
  if (!authorization || !authorization.startsWith("Bearer ")) {
    console.log(`[${requestId}] Missing or invalid authorization header`);
    return NextResponse.json({ message: "Missing token" }, { status: 401 });
  }

  const domain = getUrlHost(request);
  console.log(`[${requestId}] Using domain for verification: ${domain}`);

  try {
    const token = authorization.split(" ")[1] as string;
    console.log(`[${requestId}] Attempting JWT verification with domain: ${domain}`);
    
    // Now we verify the token. `domain` must match the domain of the request.
    // In our case, we're using the `getUrlHost` function to get the domain of the request
    // based on the Vercel environment. This will vary depending on your hosting provider.
    const payload = await client.verifyJwt({
      token,
      domain,
    });

    console.log(`[${requestId}] JWT verification successful!`);
    console.log(`[${requestId}] Full JWT payload:`, JSON.stringify(payload, null, 2));
    console.log(`[${requestId}] JWT payload keys:`, Object.keys(payload));
    console.log(`[${requestId}] JWT subject (FID): ${payload.sub}`);
    console.log(`[${requestId}] JWT issued at: ${payload.iat} (${new Date(payload.iat * 1000).toISOString()})`);
    console.log(`[${requestId}] JWT expires at: ${payload.exp} (${new Date(payload.exp * 1000).toISOString()})`);
    console.log(`[${requestId}] JWT audience: ${payload.aud}`);
    console.log(`[${requestId}] JWT issuer: ${payload.iss}`);
    console.log(`[${requestId}] JWT nonce: ${(payload as Record<string, unknown>).nonce}`);
    console.log(`[${requestId}] JWT additional claims:`, Object.keys(payload).filter(key => !['sub', 'iat', 'exp', 'aud', 'iss', 'nonce'].includes(key)));

    // If the token was valid, `payload.sub` will be the user's Farcaster ID.
    const userFid = payload.sub;

    const response = {
      success: true,
      user: {
        fid: userFid,
        issuedAt: payload.iat,
        expiresAt: payload.exp,
      },
      jwtToken: token, // Include the original JWT token for testing
    };

    console.log(`[${requestId}] Returning successful response:`, JSON.stringify(response, null, 2));
    console.log(`[${requestId}] JWT Auth Request Completed Successfully`);

    // Return user information for your waitlist application
    return NextResponse.json(response);

  } catch (e) {
    console.log(`[${requestId}] JWT verification failed:`, e);
    console.log(`[${requestId}] Error type:`, e?.constructor?.name);
    console.log(`[${requestId}] Error message:`, e instanceof Error ? e.message : 'Unknown error');
    console.log(`[${requestId}] Error stack:`, e instanceof Error ? e.stack : 'No stack trace');
    
    if (e instanceof Errors.InvalidTokenError) {
      console.log(`[${requestId}] InvalidTokenError - returning 401`);
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    if (e instanceof Error) {
      console.log(`[${requestId}] Generic Error - returning 500`);
      return NextResponse.json({ message: e.message }, { status: 500 });
    }
    console.log(`[${requestId}] Unknown error type - rethrowing`);
    throw e;
  }
}