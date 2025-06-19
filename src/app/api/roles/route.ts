import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: {
        templates: true,
        _count: {
          select: {
            templates: true,
            projectRoles: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { message: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { message: "Role name is required" },
        { status: 400 }
      );
    }

    // Check if role with this name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name: name.trim() },
    });

    if (existingRole) {
      return NextResponse.json(
        { message: "A role with this name already exists" },
        { status: 400 }
      );
    }

    const role = await prisma.role.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { message: "Failed to create role" },
      { status: 500 }
    );
  }
}
