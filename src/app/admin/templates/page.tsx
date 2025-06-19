import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";

async function getTemplates() {
  return await prisma.template.findMany({
    include: {
      role: true,
      templateTasks: true,
      _count: {
        select: {
          templateTasks: true,
        },
      },
    },
    orderBy: [
      { role: { name: 'asc' } },
      { name: 'asc' },
    ],
  });
}

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Templates</h1>
          <p className="text-gray-600 mt-2">
            Create and manage task templates for different roles
          </p>
        </div>
        <Link href="/admin/templates/new">
          <Button>Create New Template</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
          <CardDescription>
            Overview of all task templates in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No templates created yet</p>
              <Link href="/admin/templates/new">
                <Button>Create Your First Template</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Auto-Assign</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.role.name}</Badge>
                    </TableCell>
                    <TableCell>{template.description || 'No description'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {template._count.templateTasks} task{template._count.templateTasks !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {template.autoAssign ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                          Auto
                        </Badge>
                      ) : (
                        <Badge variant="outline">Manual</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/admin/templates/${template.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link href={`/admin/templates/${template.id}/edit`}>
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

      {/* Templates by Role */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(
          templates.reduce((acc, template) => {
            const roleName = template.role.name;
            if (!acc[roleName]) {
              acc[roleName] = [];
            }
            acc[roleName].push(template);
            return acc;
          }, {} as Record<string, typeof templates>)
        ).map(([roleName, roleTemplates]) => (
          <Card key={roleName}>
            <CardHeader>
              <CardTitle className="text-lg">{roleName}</CardTitle>
              <CardDescription>
                {roleTemplates.length} template{roleTemplates.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {roleTemplates.map((template) => (
                  <div key={template.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-gray-500">
                        {template._count.templateTasks} tasks
                        {template.autoAssign && " • Auto-assign"}
                      </p>
                    </div>
                    <Link href={`/admin/templates/${template.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {templates.reduce((sum, template) => sum + template._count.templateTasks, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Auto-Assign</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {templates.filter(t => t.autoAssign).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Manual Assign</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {templates.filter(t => !t.autoAssign).length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
