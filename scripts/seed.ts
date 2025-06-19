import { seedDatabase } from '../src/lib/seed';

async function main() {
  try {
    const result = await seedDatabase();
    console.log('\n📊 Seed Summary:');
    console.log(`   Roles: ${result.roles}`);
    console.log(`   Templates: ${result.templates}`);
    console.log(`   Projects: ${result.projects}`);
    console.log(`   Tasks: ${result.tasks}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database:', error);
    process.exit(1);
  }
}

main();
