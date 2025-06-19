import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import Breadcrumb from "@/components/Breadcrumb";

interface UserDetailProps {
  params: Promise<{
    id: string;
  }>;
}

async function getUserDetail(userId: number) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      jobRole: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
      projectRoles: {
        include: {
          role: true,
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              startDate: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          projectRoles: true,
        },
      },
    },
  });
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'ADMIN':
      return 'destructive';
    case 'MANAGER':
      return 'default';
    case 'USER':
      return 'secondary';
    default:
      return 'outline';
  }
}

export default async function UserDetailPage({ params }: UserDetailProps) {
  const resolvedParams = await params;
  const userId = parseInt(resolvedParams.id);
  
  if (isNaN(userId)) {
    notFound();
  }

  const user = await getUserDetail(userId);
  
  if (!user) {
    notFound();
  }

  const userDisplayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.username;

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/users" },
          { label: userDisplayName },
        ]}
      />
      
      <PageHeader
        title={`User: ${userDisplayName}`}
        description="View user details and project assignments"
        backUrl="/admin/users"
      >
        <Link href={`/admin/users/${user.id}/edit`}>
          <Button>Edit User</Button>
        </Link>
      </PageHeader>

      {/* User Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Basic user details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-lg">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : 'Not provided'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Username</label>
              <p className="text-lg">@{user.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Account Created</label>
              <p className="text-lg">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roles & Permissions</CardTitle>
            <CardDescription>
              System access and job role assignments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">System Role</label>
              <div className="mt-1">
                <Badge variant={getRoleBadgeVariant(user.systemRole)}>
                  {user.systemRole}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Job Role</label>
              <div className="mt-1">
                {user.jobRole ? (
                  <Badge variant="outline">
                    {user.jobRole.name}
                  </Badge>
                ) : (
                  <span className="text-gray-400 text-sm">No job role assigned</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Account Status</label>
              <div className="mt-1">
                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Project Assignments</label>
              <p className="text-lg">
                {user._count.projectRoles} project{user._count.projectRoles !== 1 ? 's' : ''}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Project Assignments</CardTitle>
          <CardDescription>
            Projects where this user has been assigned roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.projectRoles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No project assignments yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.projectRoles.map((projectRole) => (
                  <TableRow key={projectRole.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{projectRole.project.name}</div>
                        {projectRole.project.description && (
                          <div className="text-sm text-gray-500">
                            {projectRole.project.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {projectRole.role.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(projectRole.project.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(projectRole.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/projects/${projectRole.project.id}`}>
                        <Button variant="outline" size="sm">
                          View Project
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common actions for this user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Link href={`/dashboard/${user.username}`}>
              <Button variant="outline">
                View User Dashboard
              </Button>
            </Link>
            <Link href={`/admin/users/${user.id}/edit`}>
              <Button variant="outline">
                Edit User Details
              </Button>
            </Link>
            <Link href={`/admin/users/${user.id}/edit#password`}>
              <Button variant="outline" className="text-orange-600 border-orange-600 hover:bg-orange-50">
                Reset Password
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
