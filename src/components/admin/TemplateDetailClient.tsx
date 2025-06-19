"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TemplateTask {
  id: number;
  description: string;
  offsetDays: number;
  isRecurring: boolean;
  isCritical: boolean;
}

interface Template {
  id: number;
  name: string;
  description?: string;
  autoAssign: boolean;
  role: {
    id: number;
    name: string;
  };
  templateTasks: TemplateTask[];
  _count: {
    templateTasks: number;
  };
}

interface TemplateDetailClientProps {
  template: Template;
}

export default function TemplateDetailClient({ template }: TemplateDetailClientProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the template "${template.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/templates/${template.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/templates");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete template");
      }
    } catch (err) {
      setError("An error occurred while deleting the template");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
          <p className="text-gray-600 mt-2">
            Template for {template.role.name}
          </p>
          {template.description && (
            <p className="text-gray-600 mt-1">{template.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/templates/${template.id}/edit`}>
            <Button variant="outline">Edit Template</Button>
          </Link>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Template"}
          </Button>
          <Link href="/admin/templates">
            <Button variant="outline">Back to Templates</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Template Info */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Role</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-base px-3 py-1">
              {template.role.name}
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{template._count.templateTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Auto-Assign</CardTitle>
          </CardHeader>
          <CardContent>
            {template.autoAssign ? (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                Enabled
              </Badge>
            ) : (
              <Badge variant="outline">Disabled</Badge>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Critical Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {template.templateTasks.filter(t => t.isCritical).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Template Tasks</CardTitle>
          <CardDescription>
            Tasks that will be created when this template is applied to a project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {template.templateTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tasks defined for this template</p>
              <Link href={`/admin/templates/${template.id}/edit`}>
                <Button>Add Tasks</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Description</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Due Date Offset</TableHead>
                  <TableHead>Properties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {template.templateTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {task.offsetDays >= 0 ? `T+${task.offsetDays}` : `T${task.offsetDays}`} days
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.offsetDays === 0 ? (
                        <span className="text-blue-600 font-medium">Project Start</span>
                      ) : task.offsetDays > 0 ? (
                        <span className="text-green-600">{task.offsetDays} days after start</span>
                      ) : (
                        <span className="text-orange-600">{Math.abs(task.offsetDays)} days before start</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {task.isCritical && (
                          <Badge variant="destructive" className="text-xs">
                            Critical
                          </Badge>
                        )}
                        {task.isRecurring && (
                          <Badge variant="secondary" className="text-xs">
                            Recurring
                          </Badge>
                        )}
                        {!task.isCritical && !task.isRecurring && (
                          <Badge variant="outline" className="text-xs">
                            Standard
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Timeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Task Timeline</CardTitle>
          <CardDescription>
            Visual representation of when tasks are due relative to project start
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {template.templateTasks
              .sort((a, b) => a.offsetDays - b.offsetDays)
              .map((task) => (
                <div key={task.id} className="flex items-center gap-4">
                  <div className="w-20 text-right">
                    <Badge variant="outline" className="text-xs">
                      {task.offsetDays >= 0 ? `T+${task.offsetDays}` : `T${task.offsetDays}`}
                    </Badge>
                  </div>
                  <div className="flex-1 p-3 border rounded-lg bg-gray-50">
                    <p className="font-medium">{task.description}</p>
                    <div className="flex gap-1 mt-1">
                      {task.isCritical && (
                        <Badge variant="destructive" className="text-xs">
                          Critical
                        </Badge>
                      )}
                      {task.isRecurring && (
                        <Badge variant="secondary" className="text-xs">
                          Recurring
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
