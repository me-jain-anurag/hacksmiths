// scripts/add-emr-api-key.js
// Add EMR API key to the database

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addEmrApiKey() {
  try {
    console.log('🔧 Adding EMR API key to database...');

    // Check if API key already exists
    const existingClient = await prisma.client.findUnique({
      where: { apiKey: 'lMqWaS9eAWR6BB4hcLzU9nF0NHth3z99' }
    });

    if (existingClient) {
      console.log('✅ EMR API key already exists:', existingClient.name);
      return;
    }

    // Create new client with EMR API key
    const emrClient = await prisma.client.create({
      data: {
        name: 'EMR Backend Client',
        apiKey: 'lMqWaS9eAWR6BB4hcLzU9nF0NHth3z99'
      }
    });

    console.log('✅ EMR API key added successfully:');
    console.log('   Client ID:', emrClient.id);
    console.log('   Client Name:', emrClient.name);
    console.log('   API Key:', emrClient.apiKey);
    console.log('   Created At:', emrClient.createdAt);

    // List all clients
    const allClients = await prisma.client.findMany();
    console.log('\n📋 All API clients in database:');
    allClients.forEach(client => {
      console.log(`   - ${client.name}: ${client.apiKey}`);
    });

  } catch (error) {
    console.error('❌ Error adding EMR API key:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addEmrApiKey();