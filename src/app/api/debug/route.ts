import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Check if users exist
    const userCount = await prisma.user.count();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        systemRole: true,
        isActive: true,
        createdAt: true
      }
    });

    // Check if roles exist
    const roleCount = await prisma.role.count();
    const roles = await prisma.role.findMany();

    return NextResponse.json({
      database_status: 'connected',
      users: {
        count: userCount,
        data: users
      },
      roles: {
        count: roleCount,
        data: roles
      },
      message: userCount === 0 ? 'Database is empty - needs seeding' : 'Database has data'
    });

  } catch (error) {
    console.error('Database debug error:', error);
    return NextResponse.json({
      database_status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Could not connect to database'
    }, { status: 500 });
  }
}
