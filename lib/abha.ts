// lib/abha.ts
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

const ABHA_JWKS_URL = process.env.ABHA_JWKS_URL!;
const ABHA_ISSUER = process.env.ABHA_ISSUER!;
const ABHA_AUDIENCE = process.env.ABHA_AUDIENCE!;

// createRemoteJWKSet returns a function that can be passed to jwtVerify.
// It also internally caches keys (and refreshes them if kid not found)
const jwks = createRemoteJWKSet(new URL(ABHA_JWKS_URL));

export type AbhaClaims = JWTPayload & {
  sub?: string;           // subject - typically user identifier
  client_id?: string;     // client app id (EMR)
  scope?: string | string[]; // scopes (space-separated string or array)
  hprid?: string;         // some ABHA tokens may include HPRID
  // other claims your implementation expects...
};

export class AbhaVerificationError extends Error {
  public code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AbhaVerificationError';
    this.code = code;
  }
}

/**
 * Verify ABHA JWT token and required scopes.
 * Throws AbhaVerificationError on failure.
 */
export async function verifyAbhaJwt(token: string, requiredScopes: string[] = []): Promise<AbhaClaims> {
  // Quick dev bypass (ONLY FOR LOCAL DEV) - DO NOT USE IN PRODUCTION
  if (process.env.ALLOW_INSECURE_DEV === 'true') {
    try {
      // naive decode (no verification)
      const base64 = (s: string) => Buffer.from(s, 'base64').toString('utf8');
      const payload = JSON.parse(base64(token.split('.')[1]));
      const claims = payload as AbhaClaims;
      // basic scope check
      if (requiredScopes.length) {
        const scopeString = (claims.scope ?? '') as string;
        const scopes = typeof scopeString === 'string' ? scopeString.split(/\s+/) : Array.isArray(scopeString) ? scopeString : [];
        for (const rs of requiredScopes) if (!scopes.includes(rs)) throw new AbhaVerificationError('insufficient_scope', 'insufficient_scope');
      }
      return claims;
    } catch {
      throw new AbhaVerificationError('dev-bypass-failed', 'invalid_token');
    }
  }

  // Normal verification path
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: ABHA_ISSUER,
      audience: ABHA_AUDIENCE,
      // jose will check expiration/nbf/iat automatically
    });

    const claims = payload as AbhaClaims;

    // Normalize scope -> array
    const scopeClaim = claims.scope ?? claims['scp'];
    const scopes: string[] = typeof scopeClaim === 'string' ? scopeClaim.split(/\s+/) : Array.isArray(scopeClaim) ? scopeClaim : [];

    // Required scopes check
    for (const rs of requiredScopes) {
      if (!scopes.includes(rs)) {
        throw new AbhaVerificationError(`Missing required scope: ${rs}`, 'insufficient_scope');
      }
    }

    return claims;
  } catch (err: unknown) {
    // Map jose errors and bubble up with useful codes
    const error = err as Error & { code?: string };
    if (error?.code === 'ERR_JWKS_NO_KEYS' || /no keys/i.test(error?.message)) {
      throw new AbhaVerificationError('JWKS keys not available', 'jwks_unavailable');
    }
    if (error?.name === 'JWTExpired') {
      throw new AbhaVerificationError('Token expired', 'token_expired');
    }
    // Generic invalid token
    throw new AbhaVerificationError(error?.message ?? 'Invalid token', 'invalid_token');
  }
}
