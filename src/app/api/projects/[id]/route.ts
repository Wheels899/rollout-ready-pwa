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
        // Check if task already exists for this role
        const existingTask = await prisma.projectTask.findFirst({
          where: {
            projectId,
            templateTaskId: templateTask.id,
            projectRoleId: projectRole.id,
          }
        });

        if (!existingTask) {
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
}

// GET /api/projects/[id] - Get project by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { message: "Invalid project ID" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        projectRoles: {
          include: {
            role: true,
            user: true,
          },
        },
        _count: {
          select: {
            projectTasks: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { message: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { message: "Invalid project ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, startDate, roleAssignments } = body;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        projectRoles: true,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    // Update project details
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name,
        description,
        startDate: new Date(startDate),
      },
    });

    // Handle role assignments if provided
    if (roleAssignments) {
      // Get current role assignments
      const currentRoles = existingProject.projectRoles;
      const newProjectRoles = [];

      // Process role assignments
      for (const [roleIdStr, userId] of Object.entries(roleAssignments)) {
        const roleId = parseInt(roleIdStr);

        // Find existing assignment for this role
        const existingAssignment = currentRoles.find(pr => pr.roleId === roleId);

        if (userId && typeof userId === 'number') {
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

          let projectRole;
          if (existingAssignment) {
            // Update existing assignment
            projectRole = await prisma.projectRole.update({
              where: { id: existingAssignment.id },
              data: { userId },
            });
          } else {
            // Create new assignment
            projectRole = await prisma.projectRole.create({
              data: {
                projectId,
                roleId,
                userId,
              },
            });
          }
          newProjectRoles.push(projectRole);
        } else if (existingAssignment) {
          // Remove assignment if userId is undefined/null
          await prisma.projectRole.delete({
            where: { id: existingAssignment.id },
          });

          // Also remove associated tasks
          await prisma.projectTask.deleteMany({
            where: { projectRoleId: existingAssignment.id },
          });
        }
      }

      // Generate tasks for new role assignments
      await generateTasksForRoles(projectId, newProjectRoles, updatedProject.startDate);
    }

    // Get updated project with relations
    const finalProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        projectRoles: {
          include: {
            role: true,
            user: true,
          },
        },
        _count: {
          select: {
            projectTasks: true,
          },
        },
      },
    });

    return NextResponse.json(finalProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { message: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.id);
    
    if (isNaN(projectId)) {
      return NextResponse.json(
        { message: "Invalid project ID" },
        { status: 400 }
      );
    }

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    // Delete project (cascade will handle related records)
    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { message: "Failed to delete project" },
      { status: 500 }
    );
  }
}
