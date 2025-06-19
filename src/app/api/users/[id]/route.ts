import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { SystemRole } from "@prisma/client";

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        systemRole: true,
        jobRoleId: true,
        jobRole: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        isActive: true,
        createdAt: true,
        projectRoles: {
          include: {
            role: true,
            project: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { username, email, password, firstName, lastName, systemRole, jobRoleId, isActive } = body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Check for username/email conflicts (excluding current user)
    if (username || email) {
      const conflictUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                ...(username ? [{ username: username.toLowerCase() }] : []),
                ...(email ? [{ email: email.toLowerCase() }] : []),
              ],
            },
          ],
        },
      });

      if (conflictUser) {
        return NextResponse.json(
          { message: "Username or email already exists" },
          { status: 400 }
        );
      }
    }

    // Validate job role if provided
    if (jobRoleId !== undefined && jobRoleId !== null) {
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

    // Prepare update data
    const updateData: any = {};

    if (username !== undefined) updateData.username = username.toLowerCase();
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (firstName !== undefined) updateData.firstName = firstName?.trim() || null;
    if (lastName !== undefined) updateData.lastName = lastName?.trim() || null;
    if (systemRole !== undefined) updateData.systemRole = systemRole;
    if (jobRoleId !== undefined) updateData.jobRoleId = jobRoleId ? parseInt(jobRoleId) : null;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Hash new password if provided
    if (password && password.length >= 6) {
      updateData.password = await hashPassword(password);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user (soft delete by setting isActive to false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "User deactivated successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Failed to delete user" },
      { status: 500 }
    );
  }
}
