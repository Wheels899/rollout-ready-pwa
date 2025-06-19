import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { SystemRole } from '@prisma/client';

export async function GET() {
  try {
    console.log('🔧 Resetting admin user...');
    
    // Delete existing admin user if exists
    await prisma.user.deleteMany({
      where: {
        OR: [
          { username: 'admin' },
          { email: 'admin@rolloutready.com' }
        ]
      }
    });
    
    // Create fresh admin user
    const hashedPassword = await hashPassword('admin123');
    
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@rolloutready.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        systemRole: SystemRole.ADMIN,
        isActive: true
      }
    });
    
    // Check if user was created
    const userCheck = await prisma.user.findUnique({
      where: { username: 'admin' },
      select: {
        id: true,
        username: true,
        email: true,
        systemRole: true,
        isActive: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Admin user reset successfully!',
      user: userCheck,
      instructions: 'You can now login with admin/admin123'
    });
    
  } catch (error) {
    console.error('❌ Admin reset failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Admin reset failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
