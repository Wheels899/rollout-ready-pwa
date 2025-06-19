import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { SystemRole } from '@prisma/client';

export async function GET() {
  try {
    console.log('🔧 Initializing system...');

    // Check if admin user exists
    let adminUser = await prisma.user.findFirst({
      where: { systemRole: SystemRole.ADMIN }
    });

    if (!adminUser) {
      console.log('Creating admin user...');
      // Create admin user
      adminUser = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@rolloutready.com',
          password: await hashPassword('admin123'),
          firstName: 'System',
          lastName: 'Administrator',
          systemRole: SystemRole.ADMIN,
          isActive: true
        }
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Get system stats
    const stats = await Promise.all([
      prisma.user.count(),
      prisma.role.count(),
      prisma.template.count(),
      prisma.project.count()
    ]);

    return NextResponse.json({
      success: true,
      message: 'System initialized successfully',
      admin: {
        username: adminUser.username,
        email: adminUser.email
      },
      stats: {
        users: stats[0],
        roles: stats[1],
        templates: stats[2],
        projects: stats[3]
      },
      instructions: 'Login with admin/admin123'
    });

  } catch (error) {
    console.error('❌ Initialization failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Initialization failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
