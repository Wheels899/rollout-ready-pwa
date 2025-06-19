import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import Breadcrumb from "@/components/Breadcrumb";

async function getStats() {
  const [rolesCount, templatesCount, projectsCount, tasksCount, usersCount] = await Promise.all([
    prisma.role.count(),
    prisma.template.count(),
    prisma.project.count(),
    prisma.projectTask.count(),
    prisma.user.count({ where: { isActive: true } }),
  ]);

  return {
    rolesCount,
    templatesCount,
    projectsCount,
    tasksCount,
    usersCount,
  };
}

async function getRecentProjects() {
  return await prisma.project.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      projectRoles: {
        include: {
          role: true,
          user: true,
        },
      },
      _count: {
        select: {
          projectTasks: true,
        },
      },
    },
  });
}

export default async function AdminPage() {
  const stats = await getStats();
  const recentProjects = await getRecentProjects();

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: "Admin" },
        ]}
      />

      <PageHeader
        title={stats.usersCount ? 'System Admin Dashboard' : 'Admin Dashboard'}
        description={stats.usersCount ? 'Complete system administration and project management' : 'Manage roles, templates, and projects for Rollout Ready'}
        showBackButton={false}
        showHomeButton={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rolesCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.templatesCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projectsCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasksCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usersCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Users</CardTitle>
            <CardDescription>
              Create and manage system users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/users">
              <Button className="w-full">Manage Users</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Roles</CardTitle>
            <CardDescription>
              Create and manage project roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/roles">
              <Button className="w-full">Manage Roles</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Templates</CardTitle>
            <CardDescription>
              Create and edit task templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/templates">
              <Button className="w-full">Manage Templates</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Project</CardTitle>
            <CardDescription>
              Start a new implementation project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/projects/new">
              <Button className="w-full">Create Project</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>
            Latest projects and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentProjects.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No projects created yet</p>
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm text-gray-600">
                      Start Date: {new Date(project.startDate).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {project.projectRoles.map((pr) => (
                        <Badge key={pr.id} variant="secondary">
                          {pr.role.name}: {pr.user.username}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {project._count.projectTasks} tasks
                    </p>
                    <Link href={`/admin/projects/${project.id}`}>
                      <Button variant="outline" size="sm" className="mt-2">
                        View Project
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
