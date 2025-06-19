import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/templates/[id] - Get template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const templateId = parseInt(resolvedParams.id);
    
    if (isNaN(templateId)) {
      return NextResponse.json(
        { message: "Invalid template ID" },
        { status: 400 }
      );
    }

    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        role: true,
        templateTasks: {
          orderBy: { offsetDays: 'asc' },
        },
        _count: {
          select: {
            templateTasks: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { message: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

// PUT /api/templates/[id] - Update template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const templateId = parseInt(resolvedParams.id);
    
    if (isNaN(templateId)) {
      return NextResponse.json(
        { message: "Invalid template ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, roleId, autoAssign, tasks } = body;

    // Check if template exists
    const existingTemplate = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    // Update template and replace tasks
    const template = await prisma.template.update({
      where: { id: templateId },
      data: {
        name,
        description: description || null,
        roleId: parseInt(roleId),
        autoAssign: autoAssign || false,
        templateTasks: {
          deleteMany: {}, // Delete all existing tasks
          create: tasks?.map((task: any) => ({
            description: task.description,
            offsetDays: task.offsetDays,
            isRecurring: task.isRecurring || false,
            isCritical: task.isCritical || false,
          })) || [],
        },
      },
      include: {
        role: true,
        templateTasks: true,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { message: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[id] - Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const templateId = parseInt(resolvedParams.id);
    
    if (isNaN(templateId)) {
      return NextResponse.json(
        { message: "Invalid template ID" },
        { status: 400 }
      );
    }

    // Check if template exists
    const existingTemplate = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        _count: {
          select: {
            templateTasks: true,
          },
        },
      },
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    // Check if template is being used in any projects
    const projectsUsingTemplate = await prisma.projectTask.findFirst({
      where: {
        templateTask: {
          templateId: templateId,
        },
      },
    });

    if (projectsUsingTemplate) {
      return NextResponse.json(
        { message: "Cannot delete template that is currently used in projects" },
        { status: 400 }
      );
    }

    // Delete template (cascade will handle template tasks)
    await prisma.template.delete({
      where: { id: templateId },
    });

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { message: "Failed to delete template" },
      { status: 500 }
    );
  }
}
