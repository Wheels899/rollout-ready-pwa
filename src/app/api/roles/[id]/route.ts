import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/roles/[id] - Get role by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const roleId = parseInt(resolvedParams.id);
    
    if (isNaN(roleId)) {
      return NextResponse.json(
        { message: "Invalid role ID" },
        { status: 400 }
      );
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        templates: {
          include: {
            _count: {
              select: {
                templateTasks: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            templates: true,
            projectRoles: true,
          },
        },
      },
    });

    if (!role) {
      return NextResponse.json(
        { message: "Role not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error("Error fetching role:", error);
    return NextResponse.json(
      { message: "Failed to fetch role" },
      { status: 500 }
    );
  }
}

// PUT /api/roles/[id] - Update role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const roleId = parseInt(resolvedParams.id);
    
    if (isNaN(roleId)) {
      return NextResponse.json(
        { message: "Invalid role ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { message: "Role name is required" },
        { status: 400 }
      );
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!existingRole) {
      return NextResponse.json(
        { message: "Role not found" },
        { status: 404 }
      );
    }

    // Check if another role with this name already exists (excluding current role)
    const duplicateRole = await prisma.role.findFirst({
      where: { 
        name: name.trim(),
        id: { not: roleId },
      },
    });

    if (duplicateRole) {
      return NextResponse.json(
        { message: "A role with this name already exists" },
        { status: 400 }
      );
    }

    // Update role
    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
      include: {
        _count: {
          select: {
            templates: true,
            projectRoles: true,
          },
        },
      },
    });

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { message: "Failed to update role" },
      { status: 500 }
    );
  }
}

// DELETE /api/roles/[id] - Delete role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const roleId = parseInt(resolvedParams.id);
    
    if (isNaN(roleId)) {
      return NextResponse.json(
        { message: "Invalid role ID" },
        { status: 400 }
      );
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: {
            projectRoles: true,
            templates: true,
          },
        },
      },
    });

    if (!existingRole) {
      return NextResponse.json(
        { message: "Role not found" },
        { status: 404 }
      );
    }

    // Check if role is being used in projects
    if (existingRole._count.projectRoles > 0) {
      return NextResponse.json(
        { message: "Cannot delete role that is currently used in projects" },
        { status: 400 }
      );
    }

    // Delete role (this will cascade delete templates and template tasks)
    await prisma.role.delete({
      where: { id: roleId },
    });

    return NextResponse.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { message: "Failed to delete role" },
      { status: 500 }
    );
  }
}
