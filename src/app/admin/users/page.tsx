import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import Breadcrumb from "@/components/Breadcrumb";

async function getUsers() {
  return await prisma.user.findMany({
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
        },
      },
      isActive: true,
      createdAt: true,
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

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Users" },
        ]}
      />

      <PageHeader
        title="Manage Users"
        description="Create and manage system users and their permissions"
        backUrl="/admin"
      >
        <Link href="/admin/users/new">
          <Button>Create New User</Button>
        </Link>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>
            All users in the system with their roles and project assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found</p>
              <Link href="/admin/users/new">
                <Button className="mt-4">Create First User</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Job Role</TableHead>
                  <TableHead>System Role</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}` 
                            : user.username}
                        </div>
                        <div className="text-sm text-gray-500">@{user.username}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.jobRole ? (
                        <Badge variant="outline">
                          {user.jobRole.name}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">No job role</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.systemRole)}>
                        {user.systemRole}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {user._count.projectRoles} project{user._count.projectRoles !== 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        <Link href={`/admin/users/${user.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link href={`/admin/users/${user.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Link href={`/admin/users/${user.id}/edit#password`}>
                          <Button variant="outline" size="sm" className="text-orange-600 border-orange-600 hover:bg-orange-50">
                            Reset Password
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
