import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Helper function to generate tasks for role assignments
async function generateTasksForRoles(projectId: number, projectRoles: any[], startDate: Date) {
  // Get templates that should be auto-assigned for these roles
  const autoAssignTemplates = await prisma.template.findMany({
    where: {
      autoAssign: true,
      roleId: {
        in: projectRoles.map(pr => pr.roleId)
      }
    },
    include: {
      templateTasks: true
    }
  });

  // Generate project tasks from auto-assigned templates
  for (const template of autoAssignTemplates) {
    const projectRole = projectRoles.find(pr => pr.roleId === template.roleId);
    if (projectRole) {
      for (const templateTask of template.templateTasks) {
        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() + templateTask.offsetDays);

        await prisma.projectTask.create({
          data: {
            projectId,
            templateTaskId: templateTask.id,
            projectRoleId: projectRole.id,
            description: templateTask.description,
            dueDate: dueDate,
            status: 'TODO'
          }
        });
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, startDate, roleAssignments } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { message: "Project name is required" },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        { message: "Start date is required" },
        { status: 400 }
      );
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        startDate: new Date(startDate),
      },
    });

    // Create project roles for assigned users
    const projectRoles = [];
    for (const [roleIdStr, userId] of Object.entries(roleAssignments)) {
      if (userId && typeof userId === 'number') {
        const roleId = parseInt(roleIdStr);

        // Verify the user exists
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          return NextResponse.json(
            { message: `User with ID ${userId} not found` },
            { status: 400 }
          );
        }

        const projectRole = await prisma.projectRole.create({
          data: {
            projectId: project.id,
            roleId: roleId,
            userId: userId,
          },
        });
        projectRoles.push(projectRole);
      }
    }

    // Generate tasks for assigned roles
    await generateTasksForRoles(project.id, projectRoles, project.startDate);

    // Count generated tasks for response
    const taskCount = await prisma.projectTask.count({
      where: { projectId: project.id }
    });

    return NextResponse.json({
      project,
      projectRoles: projectRoles.length,
      projectTasks: taskCount,
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { message: "Failed to create project" },
      { status: 500 }
    );
  }
}
