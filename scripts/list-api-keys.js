// scripts/list-api-keys.js
// List all API keys in the database

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listApiKeys() {
  try {
    console.log('📋 Listing all API keys in database...\n');

    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'asc' }
    });

    if (clients.length === 0) {
      console.log('⚠️ No API keys found in database');
      return;
    }

    console.log('✅ Found API keys:');
    clients.forEach((client, index) => {
      console.log(`\n${index + 1}. Client: "${client.name}"`);
      console.log(`   ID: ${client.id}`);
      console.log(`   API Key: ${client.apiKey}`);
      console.log(`   Created: ${client.createdAt.toISOString()}`);
    });

    console.log('\n🔧 For EMR backend, use one of these API keys in your .env file:');
    console.log('MAIN_BACKEND_API_KEY=<api_key_from_above>');

  } catch (error) {
    console.error('❌ Error listing API keys:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listApiKeys();