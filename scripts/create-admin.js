import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('🔧 Checking for admin user...');
  const adminEmail = 'admin@setu.com';

  try {
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists.');
      return;
    }

    console.log('Creating admin user...');
    // IMPORTANT: Change this password in a real application
    const hashedPassword = await bcrypt.hash('password123', 12);

    await prisma.admin.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: password123`);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();