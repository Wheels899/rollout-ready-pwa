import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/tasks/user/[username] - Get tasks assigned to a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const resolvedParams = await params;
    const username = resolvedParams.username;

    if (!username) {
      return NextResponse.json(
        { message: "Username is required" },
        { status: 400 }
      );
    }

    // Get user's tasks across all projects
    const tasks = await prisma.projectTask.findMany({
      where: {
        projectRole: {
          user: {
            username: username
          }
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            startDate: true
          }
        },
        projectRole: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true
              }
            },
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        templateTask: {
          select: {
            id: true,
            description: true,
            isRecurring: true,
            isCritical: true
          }
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Group tasks by project for better organization
    const tasksByProject = tasks.reduce((acc, task) => {
      const projectId = task.project.id;
      if (!acc[projectId]) {
        acc[projectId] = {
          project: task.project,
          role: task.projectRole.role,
          tasks: []
        };
      }
      acc[projectId].tasks.push({
        id: task.id,
        description: task.description,
        dueDate: task.dueDate,
        status: task.status,
        comments: task.comments,
        isRecurring: task.templateTask?.isRecurring || false,
        isCritical: task.templateTask?.isCritical || false,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      });
      return acc;
    }, {} as Record<number, any>);

    // Convert to array format
    const projectTasks = Object.values(tasksByProject);

    // Calculate summary statistics
    const summary = {
      totalTasks: tasks.length,
      todoTasks: tasks.filter(t => t.status === 'TODO').length,
      inProgressTasks: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      doneTasks: tasks.filter(t => t.status === 'DONE').length,
      overdueTasks: tasks.filter(t => t.status !== 'DONE' && new Date(t.dueDate) < new Date()).length,
      criticalTasks: tasks.filter(t => t.templateTask?.isCritical && t.status !== 'DONE').length,
      activeProjects: Object.keys(tasksByProject).length
    };

    return NextResponse.json({
      summary,
      projectTasks,
      allTasks: tasks
    });

  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return NextResponse.json(
      { message: "Failed to fetch user tasks" },
      { status: 500 }
    );
  }
}
