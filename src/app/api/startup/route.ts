import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { SystemRole } from '@prisma/client';

export async function GET() {
  try {
    console.log('🚀 Starting application initialization...');

    // Check database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Ensure admin user exists
    let adminUser = await prisma.user.findFirst({
      where: { systemRole: SystemRole.ADMIN }
    });

    if (!adminUser) {
      console.log('Creating admin user...');
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
      console.log('✅ Admin user exists');
    }

    // Get system statistics
    const [userCount, roleCount, templateCount, projectCount] = await Promise.all([
      prisma.user.count(),
      prisma.role.count(),
      prisma.template.count(),
      prisma.project.count()
    ]);

    console.log('📊 System Statistics:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Roles: ${roleCount}`);
    console.log(`   Templates: ${templateCount}`);
    console.log(`   Projects: ${projectCount}`);

    // Check if we need to seed data
    const needsSeeding = roleCount === 0 || templateCount === 0;

    return NextResponse.json({
      success: true,
      message: 'Application initialized successfully',
      data: {
        admin: {
          username: adminUser.username,
          email: adminUser.email
        },
        stats: {
          users: userCount,
          roles: roleCount,
          templates: templateCount,
          projects: projectCount
        },
        needsSeeding,
        instructions: [
          'Login with admin/admin123',
          needsSeeding ? 'Consider running /api/setup to seed sample data' : 'System ready to use'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Application initialization failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
