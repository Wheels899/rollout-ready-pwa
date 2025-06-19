import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - startTime;

    // Check if admin user exists
    const adminExists = await prisma.user.findFirst({
      where: { systemRole: 'ADMIN' }
    });

    // Get basic stats
    const [userCount, roleCount, templateCount, projectCount] = await Promise.all([
      prisma.user.count(),
      prisma.role.count(),
      prisma.template.count(),
      prisma.project.count()
    ]);

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        responseTime: `${dbResponseTime}ms`
      },
      system: {
        adminUserExists: !!adminExists,
        users: userCount,
        roles: roleCount,
        templates: templateCount,
        projects: projectCount
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        version: process.env.npm_package_version || 'unknown'
      }
    };

    return NextResponse.json(health);

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        database: {
          connected: false
        }
      },
      { status: 503 }
    );
  }
}
