import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Load environment variables from .env.local
config({ path: '../.env.local' });

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('🔧 Checking for admin user...');
  const adminEmail = 'shaiz@setu.com';

  try {
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists.');
      console.log('🔄 Updating password to ensure it\'s properly hashed...');
      
      // Hash the password with bcrypt
      const hashedPassword = await bcrypt.hash('12345678', 12);
      
      // Update the existing admin with hashed password
      await prisma.admin.update({
        where: { email: adminEmail },
        data: { password: hashedPassword },
      });
      
      console.log('✅ Admin password updated and hashed successfully!');
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: 12345678`);
      return;
    }

    console.log('Creating admin user...');
    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash('12345678', 12);

    await prisma.admin.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: 12345678`);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();