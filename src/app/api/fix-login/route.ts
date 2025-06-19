import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Simple password hash for 'admin123'
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create or update admin user
    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {
        password: hashedPassword,
        isActive: true
      },
      create: {
        username: 'admin',
        email: 'admin@test.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        systemRole: 'ADMIN',
        isActive: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Login fixed! Use admin/admin123',
      user: {
        username: adminUser.username,
        email: adminUser.email
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    });
  }
}
