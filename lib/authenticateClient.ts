// lib/authenticateClient.ts
import { prisma } from './prisma';

export interface AuthenticatedClient {
  id: number;
  name: string;
  apiKey: string;
  createdAt: Date;
}

/**
 * Authenticate client using X-API-Key header
 * @param req - The request object
 * @returns Promise<AuthenticatedClient> - The authenticated client
 * @throws Error if API key is missing or invalid
 */
export async function authenticateClient(req: Request): Promise<AuthenticatedClient> {
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    throw new Error("Missing X-API-Key header");
  }

  const client = await prisma.client.findUnique({
    where: { apiKey },
  });

  if (!client) {
    throw new Error("Invalid API key");
  }

  return client;
}

/**
 * Generate a secure random API key
 * @param length - Length of the API key (default: 32)
 * @returns A random API key string
 */
export function generateApiKey(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}