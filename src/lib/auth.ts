import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './db';
import { SystemRole } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  systemRole: SystemRole;
}

export interface SessionData {
  userId: number;
  username: string;
  systemRole: SystemRole;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload: SessionData): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string): SessionData | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionData;
  } catch {
    return null;
  }
}

// Create user session
export async function createSession(userId: number): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, systemRole: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const token = generateToken({
    userId: user.id,
    username: user.username,
    systemRole: user.systemRole
  });

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + SESSION_DURATION)
    }
  });

  return token;
}

// Validate session
export async function validateSession(token: string): Promise<AuthUser | null> {
  try {
    // Check if session exists in database
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      // Clean up expired session
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return null;
    }

    // Verify JWT token
    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    return {
      id: session.user.id,
      username: session.user.username,
      email: session.user.email,
      firstName: session.user.firstName || undefined,
      lastName: session.user.lastName || undefined,
      systemRole: session.user.systemRole
    };
  } catch {
    return null;
  }
}

// Logout (delete session)
export async function logout(token: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { token }
  });
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });
}

// Check if user has required system role
export function hasSystemRole(userRole: SystemRole, requiredRole: SystemRole): boolean {
  const roleHierarchy = {
    [SystemRole.USER]: 0,
    [SystemRole.MANAGER]: 1,
    [SystemRole.ADMIN]: 2
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Get user's project roles
export async function getUserProjectRoles(userId: number) {
  return prisma.projectRole.findMany({
    where: { userId },
    include: {
      project: true,
      role: true
    }
  });
}
