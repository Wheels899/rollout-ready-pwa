import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import Breadcrumb from "@/components/Breadcrumb";

async function getRoles() {
  return await prisma.role.findMany({
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
}

export default async function RolesPage() {
  const roles = await getRoles();

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Roles" },
        ]}
      />

      <PageHeader
        title="Manage Roles"
        description="Create and manage project roles and their associated templates"
        backUrl="/admin"
      >
        <Link href="/admin/roles/new">
          <Button>Create New Role</Button>
        </Link>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>All Roles</CardTitle>
          <CardDescription>
            Overview of all project roles in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {roles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No roles created yet</p>
              <Link href="/admin/roles/new">
                <Button>Create Your First Role</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Templates</TableHead>
                  <TableHead>Projects Used</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>{role.description || 'No description'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {role._count.templates} template{role._count.templates !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {role._count.projectRoles} project{role._count.projectRoles !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/admin/roles/${role.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link href={`/admin/roles/${role.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
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

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{roles.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {roles.reduce((sum, role) => sum + role._count.templates, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active in Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {roles.reduce((sum, role) => sum + role._count.projectRoles, 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
