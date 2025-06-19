import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface RoleDetailProps {
  params: Promise<{
    id: string;
  }>;
}

async function getRole(id: number) {
  return await prisma.role.findUnique({
    where: { id },
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
      projectRoles: {
        include: {
          project: true,
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          templates: true,
          projectRoles: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }: RoleDetailProps): Promise<Metadata> {
  const resolvedParams = await params;
  const roleId = parseInt(resolvedParams.id);

  if (isNaN(roleId)) {
    return { title: 'Role Not Found - Rollout Ready' };
  }

  const role = await getRole(roleId);

  if (!role) {
    return { title: 'Role Not Found - Rollout Ready' };
  }

  return {
    title: `${role.name} - Rollout Ready`,
    description: role.description || `Role details for ${role.name}`,
  };
}

export default async function RoleDetailPage({ params }: RoleDetailProps) {
  const resolvedParams = await params;
  const roleId = parseInt(resolvedParams.id);
  
  if (isNaN(roleId)) {
    notFound();
  }

  const role = await getRole(roleId);

  if (!role) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{role.name}</h1>
          <p className="text-gray-600 mt-2">
            Role details and associated templates
          </p>
          {role.description && (
            <p className="text-gray-600 mt-1">{role.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/roles/${role.id}/edit`}>
            <Button variant="outline">Edit Role</Button>
          </Link>
          <Link href="/admin/roles">
            <Button variant="outline">Back to Roles</Button>
          </Link>
        </div>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{role._count.templates}</div>
            <p className="text-xs text-gray-600">Associated templates</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Project Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{role._count.projectRoles}</div>
            <p className="text-xs text-gray-600">Times used in projects</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {role.templates.reduce((sum, template) => sum + template._count.templateTasks, 0)}
            </div>
            <p className="text-xs text-gray-600">Tasks across all templates</p>
          </CardContent>
        </Card>
      </div>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Associated Templates</CardTitle>
          <CardDescription>
            Templates that use this role
          </CardDescription>
        </CardHeader>
        <CardContent>
          {role.templates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No templates created for this role yet</p>
              <Link href="/admin/templates/new">
                <Button>Create Template</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Auto-Assign</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {role.templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.description || 'No description'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {template._count.templateTasks} task{template._count.templateTasks !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {template.autoAssign ? (
                        <Badge variant="default">Auto-assign</Badge>
                      ) : (
                        <Badge variant="outline">Manual</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/templates/${template.id}`}>
                        <Button variant="outline" size="sm">
                          View
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

      {/* Recent Project Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Project Usage</CardTitle>
          <CardDescription>
            Recent projects where this role has been assigned
          </CardDescription>
        </CardHeader>
        <CardContent>
          {role.projectRoles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">This role hasn't been used in any projects yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Assigned Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {role.projectRoles.slice(0, 10).map((projectRole) => (
                  <TableRow key={projectRole.id}>
                    <TableCell className="font-medium">{projectRole.project.name}</TableCell>
                    <TableCell>
                      {projectRole.user.firstName} {projectRole.user.lastName} ({projectRole.user.username})
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
    </div>
  );
}
