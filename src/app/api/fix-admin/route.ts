import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { SystemRole } from '@prisma/client';

export async function GET() {
  try {
    console.log('🔧 Fixing admin user role...');

    // Find the admin user by username
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (!adminUser) {
      return NextResponse.json({
        success: false,
        message: 'Admin user not found'
      }, { status: 404 });
    }

    console.log('Current admin user role:', adminUser.systemRole);

    // Update the admin user to have ADMIN role
    const updatedUser = await prisma.user.update({
      where: { username: 'admin' },
      data: {
        systemRole: SystemRole.ADMIN,
        firstName: 'System',
        lastName: 'Administrator',
        isActive: true
      }
    });

    console.log('✅ Admin user role updated to:', updatedUser.systemRole);

    return NextResponse.json({
      success: true,
      message: 'Admin user role fixed successfully',
      data: {
        username: updatedUser.username,
        oldRole: adminUser.systemRole,
        newRole: updatedUser.systemRole,
        instructions: [
          'Admin user role has been updated to ADMIN',
          'Please logout and login again',
          'You should now see the admin interface'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Failed to fix admin user role:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fix admin user role', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
