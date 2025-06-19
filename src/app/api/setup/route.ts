import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function POST() {
  try {
    console.log('🌱 Setting up database...');
    
    const result = await seedDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Database setup complete!',
      data: result
    });
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database setup failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('🌱 Setting up database via GET...');

    const result = await seedDatabase();

    return NextResponse.json({
      success: true,
      message: 'Database setup complete!',
      data: result,
      instructions: 'You can now login with admin/admin123'
    });

  } catch (error) {
    console.error('❌ Database setup failed:', error);

    return NextResponse.json({
      success: false,
      message: 'Database setup failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
