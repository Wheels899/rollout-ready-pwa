import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/tasks/[id] - Get task by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const taskId = parseInt(resolvedParams.id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { message: "Invalid task ID" },
        { status: 400 }
      );
    }

    const task = await prisma.projectTask.findUnique({
      where: { id: taskId },
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
      }
    });

    if (!task) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { message: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const taskId = parseInt(resolvedParams.id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { message: "Invalid task ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, comments, timeSpentMinutes, completedAt } = body;

    if (status && !['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status. Must be TODO, IN_PROGRESS, or DONE" },
        { status: 400 }
      );
    }

    // Check if task exists
    const existingTask = await prisma.projectTask.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    // Update the task
    const updatedTask = await prisma.projectTask.update({
      where: { id: taskId },
      data: {
        ...(status && { status }),
        ...(comments !== undefined && { comments: comments?.trim() || null }),
        ...(timeSpentMinutes !== undefined && { timeSpentMinutes }),
        ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
        updatedAt: new Date(),
      },
      include: {
        project: true,
        projectRole: {
          include: {
            role: true,
          },
        },
        templateTask: true,
      },
    });

    return NextResponse.json(updatedTask);

  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { message: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const taskId = parseInt(resolvedParams.id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { message: "Invalid task ID" },
        { status: 400 }
      );
    }

    // Check if task exists
    const existingTask = await prisma.projectTask.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        projectRole: {
          include: {
            user: true,
            role: true,
          },
        },
      },
    });

    if (!existingTask) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }

    // Delete task
    await prisma.projectTask.delete({
      where: { id: taskId },
    });

    return NextResponse.json({
      message: "Task deleted successfully",
      deletedTask: {
        id: existingTask.id,
        description: existingTask.description,
        project: existingTask.project.name,
        assignedTo: `${existingTask.projectRole.user.firstName} ${existingTask.projectRole.user.lastName}`,
      }
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { message: "Failed to delete task" },
      { status: 500 }
    );
  }
}
