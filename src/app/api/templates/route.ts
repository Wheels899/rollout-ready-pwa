import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      include: {
        role: true,
        templateTasks: true,
        _count: {
          select: {
            templateTasks: true,
          },
        },
      },
      orderBy: [
        { role: { name: 'asc' } },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { message: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, roleId, autoAssign, tasks } = body;

    // Validate required fields
    if (!name || !roleId) {
      return NextResponse.json(
        { message: "Name and role are required" },
        { status: 400 }
      );
    }

    // Create template with tasks
    const template = await prisma.template.create({
      data: {
        name,
        description: description || null,
        roleId: parseInt(roleId),
        autoAssign: autoAssign || false,
        templateTasks: {
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

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { message: "Failed to create template" },
      { status: 500 }
    );
  }
}
