// Database inspection tool for Rollout Ready
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function inspectDatabase() {
  console.log('🔍 ROLLOUT READY DATABASE INSPECTION');
  console.log('====================================\n');
  
  try {
    // Get counts
    const counts = await Promise.all([
      prisma.role.count(),
      prisma.template.count(),
      prisma.project.count(),
      prisma.projectTask.count(),
      prisma.projectRole.count(),
    ]);
    
    console.log('📊 DATABASE COUNTS');
    console.log('==================');
    console.log(`Roles: ${counts[0]}`);
    console.log(`Templates: ${counts[1]}`);
    console.log(`Projects: ${counts[2]}`);
    console.log(`Project Tasks: ${counts[3]}`);
    console.log(`Project Role Assignments: ${counts[4]}\n`);
    
    // Get detailed data
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            templates: true,
            projectRoles: true,
          },
        },
      },
    });
    
    console.log('👥 ROLES DETAILS');
    console.log('================');
    roles.forEach(role => {
      console.log(`• ${role.name} (ID: ${role.id})`);
      console.log(`  Templates: ${role._count.templates}, Projects: ${role._count.projectRoles}`);
    });
    console.log();
    
    const templates = await prisma.template.findMany({
      include: {
        role: true,
        templateTasks: true,
      },
    });
    
    console.log('📋 TEMPLATES DETAILS');
    console.log('====================');
    templates.forEach(template => {
      console.log(`• ${template.name} (ID: ${template.id})`);
      console.log(`  Role: ${template.role.name}`);
      console.log(`  Tasks: ${template.templateTasks.length}`);
      console.log(`  Auto-assign: ${template.autoAssign ? 'Yes' : 'No'}`);
    });
    console.log();
    
    const projects = await prisma.project.findMany({
      include: {
        projectRoles: {
          include: {
            role: true,
          },
        },
        _count: {
          select: {
            projectTasks: true,
          },
        },
      },
    });
    
    console.log('🚀 PROJECTS DETAILS');
    console.log('===================');
    projects.forEach(project => {
      console.log(`• ${project.name} (ID: ${project.id})`);
      console.log(`  Start Date: ${project.startDate.toDateString()}`);
      console.log(`  Tasks: ${project._count.projectTasks}`);
      console.log(`  Team:`);
      project.projectRoles.forEach(pr => {
        console.log(`    - ${pr.role.name}: ${pr.userName}`);
      });
    });
    console.log();
    
    // Get task status breakdown
    const taskStats = await prisma.projectTask.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });
    
    console.log('📈 TASK STATUS BREAKDOWN');
    console.log('========================');
    taskStats.forEach(stat => {
      console.log(`${stat.status}: ${stat._count.status} tasks`);
    });
    console.log();
    
    // Get user task assignments
    const userTasks = await prisma.projectRole.findMany({
      include: {
        role: true,
        project: true,
        projectTasks: {
          select: {
            status: true,
          },
        },
      },
    });
    
    console.log('👤 USER TASK ASSIGNMENTS');
    console.log('=========================');
    const userStats = {};
    userTasks.forEach(pr => {
      if (!userStats[pr.userName]) {
        userStats[pr.userName] = { total: 0, todo: 0, inProgress: 0, done: 0 };
      }
      pr.projectTasks.forEach(task => {
        userStats[pr.userName].total++;
        if (task.status === 'TODO') userStats[pr.userName].todo++;
        if (task.status === 'IN_PROGRESS') userStats[pr.userName].inProgress++;
        if (task.status === 'DONE') userStats[pr.userName].done++;
      });
    });
    
    Object.entries(userStats).forEach(([user, stats]) => {
      console.log(`• ${user}: ${stats.total} tasks (${stats.todo} todo, ${stats.inProgress} in progress, ${stats.done} done)`);
    });
    console.log();
    
    // Check for potential issues
    console.log('⚠️  POTENTIAL ISSUES CHECK');
    console.log('==========================');
    
    const issuesFound = [];
    
    // Check for projects without tasks
    const projectsWithoutTasks = projects.filter(p => p._count.projectTasks === 0);
    if (projectsWithoutTasks.length > 0) {
      issuesFound.push(`${projectsWithoutTasks.length} project(s) have no tasks`);
    }
    
    // Check for templates without tasks
    const templatesWithoutTasks = templates.filter(t => t.templateTasks.length === 0);
    if (templatesWithoutTasks.length > 0) {
      issuesFound.push(`${templatesWithoutTasks.length} template(s) have no tasks`);
    }
    
    // Check for roles without templates
    const rolesWithoutTemplates = roles.filter(r => r._count.templates === 0);
    if (rolesWithoutTemplates.length > 0) {
      issuesFound.push(`${rolesWithoutTemplates.length} role(s) have no templates`);
    }
    
    if (issuesFound.length === 0) {
      console.log('✅ No issues found!');
    } else {
      issuesFound.forEach(issue => console.log(`❌ ${issue}`));
    }
    
  } catch (error) {
    console.error('❌ Database inspection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  inspectDatabase().catch(console.error);
}

module.exports = { inspectDatabase };
