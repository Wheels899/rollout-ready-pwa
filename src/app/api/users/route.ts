import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { SystemRole } from "@prisma/client";

// GET /api/users - List all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        systemRole: true,
        jobRoleId: true,
        isActive: true,
        createdAt: true,
        jobRole: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        _count: {
          select: {
            projectRoles: true,
          },
        },
      },
      orderBy: [
        { systemRole: 'asc' },
        { firstName: 'asc' },
        { username: 'asc' },
      ],
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, firstName, lastName, systemRole, jobRoleId } = body;

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Validate job role if provided
    if (jobRoleId) {
      const jobRole = await prisma.role.findUnique({
        where: { id: parseInt(jobRoleId) }
      });

      if (!jobRole) {
        return NextResponse.json(
          { message: "Invalid job role" },
          { status: 400 }
        );
      }
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.toLowerCase() },
          { email: email.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Username or email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        systemRole: systemRole || SystemRole.USER,
        jobRoleId: jobRoleId ? parseInt(jobRoleId) : null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        systemRole: true,
        jobRoleId: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}
