import { prisma } from './db';
import { hashPassword } from './auth';
import { SystemRole } from '@prisma/client';

export async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // Create users
    console.log('Creating users...');
    const users = await Promise.all([
      prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
          username: 'admin',
          email: 'admin@rolloutready.com',
          password: await hashPassword('admin123'),
          firstName: 'System',
          lastName: 'Administrator',
          systemRole: SystemRole.ADMIN,
        },
      }),
      prisma.user.upsert({
        where: { username: 'manager' },
        update: {},
        create: {
          username: 'manager',
          email: 'manager@rolloutready.com',
          password: await hashPassword('manager123'),
          firstName: 'Project',
          lastName: 'Manager',
          systemRole: SystemRole.MANAGER,
        },
      }),
      prisma.user.upsert({
        where: { username: 'alice' },
        update: {},
        create: {
          username: 'alice',
          email: 'alice@rolloutready.com',
          password: await hashPassword('user123'),
          firstName: 'Alice',
          lastName: 'Johnson',
          systemRole: SystemRole.USER,
        },
      }),
      prisma.user.upsert({
        where: { username: 'bob' },
        update: {},
        create: {
          username: 'bob',
          email: 'bob@rolloutready.com',
          password: await hashPassword('user123'),
          firstName: 'Bob',
          lastName: 'Smith',
          systemRole: SystemRole.USER,
        },
      }),
      prisma.user.upsert({
        where: { username: 'charlie' },
        update: {},
        create: {
          username: 'charlie',
          email: 'charlie@rolloutready.com',
          password: await hashPassword('user123'),
          firstName: 'Charlie',
          lastName: 'Brown',
          systemRole: SystemRole.USER,
        },
      }),
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create roles
    const roles = await Promise.all([
      prisma.role.upsert({
        where: { name: 'Project Manager' },
        update: {},
        create: {
          name: 'Project Manager',
          description: 'Overall project coordination and management',
        },
      }),
      prisma.role.upsert({
        where: { name: 'Infrastructure Lead' },
        update: {},
        create: {
          name: 'Infrastructure Lead',
          description: 'Technical infrastructure setup and management',
        },
      }),
      prisma.role.upsert({
        where: { name: 'Security Architect' },
        update: {},
        create: {
          name: 'Security Architect',
          description: 'Security assessment and implementation',
        },
      }),
      prisma.role.upsert({
        where: { name: 'Business Analyst' },
        update: {},
        create: {
          name: 'Business Analyst',
          description: 'Business requirements and process analysis',
        },
      }),
    ]);

    console.log(`✅ Created ${roles.length} roles`);

    // Create templates for Project Manager
    const pmTemplate = await prisma.template.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Project Manager Checklist',
        description: 'Standard tasks for project managers',
        roleId: roles[0].id,
        autoAssign: true,
      },
    });

    // Create template tasks for PM
    const pmTasks = await Promise.all([
      prisma.templateTask.create({
        data: {
          templateId: pmTemplate.id,
          description: 'Create project charter and scope document',
          offsetDays: -14,
          isCritical: true,
        },
      }),
      prisma.templateTask.create({
        data: {
          templateId: pmTemplate.id,
          description: 'Conduct stakeholder kickoff meeting',
          offsetDays: -7,
          isCritical: true,
        },
      }),
      prisma.templateTask.create({
        data: {
          templateId: pmTemplate.id,
          description: 'Finalize project timeline and milestones',
          offsetDays: 0,
          isCritical: true,
        },
      }),
      prisma.templateTask.create({
        data: {
          templateId: pmTemplate.id,
          description: 'Weekly status report to stakeholders',
          offsetDays: 7,
          isRecurring: true,
        },
      }),
    ]);

    // Create templates for Infrastructure Lead
    const infraTemplate = await prisma.template.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Infrastructure Setup Checklist',
        description: 'Technical infrastructure preparation tasks',
        roleId: roles[1].id,
        autoAssign: true,
      },
    });

    const infraTasks = await Promise.all([
      prisma.templateTask.create({
        data: {
          templateId: infraTemplate.id,
          description: 'Review current infrastructure architecture',
          offsetDays: -21,
          isCritical: true,
        },
      }),
      prisma.templateTask.create({
        data: {
          templateId: infraTemplate.id,
          description: 'Prepare server environments (Dev/Test/Prod)',
          offsetDays: -14,
          isCritical: true,
        },
      }),
      prisma.templateTask.create({
        data: {
          templateId: infraTemplate.id,
          description: 'Configure network and firewall rules',
          offsetDays: -7,
          isCritical: true,
        },
      }),
      prisma.templateTask.create({
        data: {
          templateId: infraTemplate.id,
          description: 'Setup monitoring and alerting systems',
          offsetDays: 0,
        },
      }),
    ]);

    // Create templates for Security Architect
    const secTemplate = await prisma.template.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Security Assessment Checklist',
        description: 'Security review and implementation tasks',
        roleId: roles[2].id,
        autoAssign: true,
      },
    });

    const secTasks = await Promise.all([
      prisma.templateTask.create({
        data: {
          templateId: secTemplate.id,
          description: 'Conduct security risk assessment',
          offsetDays: -21,
          isCritical: true,
        },
      }),
      prisma.templateTask.create({
        data: {
          templateId: secTemplate.id,
          description: 'Review and approve security architecture',
          offsetDays: -14,
          isCritical: true,
        },
      }),
      prisma.templateTask.create({
        data: {
          templateId: secTemplate.id,
          description: 'Implement security controls and policies',
          offsetDays: -7,
          isCritical: true,
        },
      }),
      prisma.templateTask.create({
        data: {
          templateId: secTemplate.id,
          description: 'Conduct security testing and validation',
          offsetDays: 7,
          isCritical: true,
        },
      }),
    ]);

    console.log(`✅ Created templates and tasks`);
    console.log(`   - PM Template: ${pmTasks.length} tasks`);
    console.log(`   - Infrastructure Template: ${infraTasks.length} tasks`);
    console.log(`   - Security Template: ${secTasks.length} tasks`);

    // Create a sample project
    const sampleProject = await prisma.project.create({
      data: {
        name: 'Deploy MES at Avonmouth',
        description: 'Manufacturing Execution System deployment at Avonmouth facility',
        startDate: new Date('2024-02-01'),
      },
    });

    // Assign roles to the project
    const projectRoles = await Promise.all([
      prisma.projectRole.create({
        data: {
          projectId: sampleProject.id,
          roleId: roles[0].id, // PM
          userId: users[1].id, // manager user
        },
      }),
      prisma.projectRole.create({
        data: {
          projectId: sampleProject.id,
          roleId: roles[1].id, // Infrastructure
          userId: users[4].id, // charlie user
        },
      }),
      prisma.projectRole.create({
        data: {
          projectId: sampleProject.id,
          roleId: roles[2].id, // Security
          userId: users[3].id, // bob user
        },
      }),
      prisma.projectRole.create({
        data: {
          projectId: sampleProject.id,
          roleId: roles[3].id, // Business Analyst
          userId: users[2].id, // alice user
        },
      }),
    ]);

    // Generate project tasks from templates
    const allTemplateTasks = await prisma.templateTask.findMany({
      where: {
        template: {
          roleId: {
            in: [roles[0].id, roles[1].id, roles[2].id, roles[3].id],
          },
        },
      },
      include: {
        template: true,
      },
    });

    const projectTasks = [];
    for (const templateTask of allTemplateTasks) {
      const projectRole = projectRoles.find(pr => pr.roleId === templateTask.template.roleId);
      if (projectRole) {
        const dueDate = new Date(sampleProject.startDate);
        dueDate.setDate(dueDate.getDate() + templateTask.offsetDays);

        const projectTask = await prisma.projectTask.create({
          data: {
            projectId: sampleProject.id,
            templateTaskId: templateTask.id,
            projectRoleId: projectRole.id,
            description: templateTask.description,
            dueDate: dueDate,
            status: Math.random() > 0.7 ? 'DONE' : Math.random() > 0.5 ? 'IN_PROGRESS' : 'TODO',
          },
        });
        projectTasks.push(projectTask);
      }
    }

    console.log(`✅ Created sample project "${sampleProject.name}" with ${projectTasks.length} tasks`);
    console.log('🎉 Database seeded successfully!');

    return {
      roles: roles.length,
      templates: 3,
      projects: 1,
      tasks: projectTasks.length,
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}
