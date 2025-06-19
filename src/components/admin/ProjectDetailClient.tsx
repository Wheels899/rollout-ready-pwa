"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ProjectTask {
  id: number;
  description: string;
  status: string;
  dueDate: string;
  projectRole: {
    user: {
      username: string;
      firstName: string;
      lastName: string;
    };
    role: {
      name: string;
    };
  };
}

interface ProjectRole {
  id: number;
  role: {
    name: string;
  };
  user: {
    username: string;
    firstName: string;
    lastName: string;
  };
}

interface Project {
  id: number;
  name: string;
  description?: string;
  startDate: string;
  projectTasks: ProjectTask[];
  projectRoles: ProjectRole[];
}

interface ProjectDetailClientProps {
  project: Project;
}

export default function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the project "${project.name}"? This will delete all associated tasks and cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete project");
      }
    } catch (err) {
      setError("An error occurred while deleting the project");
    } finally {
      setIsDeleting(false);
    }
  };

  const taskStats = {
    total: project.projectTasks.length,
    todo: project.projectTasks.filter(t => t.status === 'TODO').length,
    inProgress: project.projectTasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: project.projectTasks.filter(t => t.status === 'DONE').length,
    overdue: project.projectTasks.filter(t => t.status !== 'DONE' && new Date(t.dueDate) < new Date()).length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TODO':
        return <Badge variant="outline">To Do</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case 'DONE':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Done</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600 mt-2">
            Started: {new Date(project.startDate).toLocaleDateString()}
          </p>
          {project.description && (
            <p className="text-gray-600 mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/projects/${project.id}/edit`}>
            <Button variant="outline">Edit Project</Button>
          </Link>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Project"}
          </Button>
          <Link href="/admin">
            <Button variant="outline">Back to Admin</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Project Stats */}
      <div className="grid md:grid-cols-5 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{taskStats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">To Do</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{taskStats.todo}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{taskStats.inProgress}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{taskStats.done}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{taskStats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Team Assignments</CardTitle>
          <CardDescription>
            Role assignments for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.projectRoles.map((projectRole) => (
              <div key={projectRole.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg">{projectRole.role.name}</h3>
                <p className="text-gray-600">{projectRole.user.firstName} {projectRole.user.lastName} ({projectRole.user.username})</p>
                <div className="mt-2">
                  <Link href={`/dashboard/${projectRole.user.username}`}>
                    <Button variant="outline" size="sm">
                      View Tasks
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Project Tasks</CardTitle>
          <CardDescription>
            All tasks for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {project.projectTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tasks found for this project</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.projectTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.description}</TableCell>
                    <TableCell>
                      {task.projectRole.user.firstName} {task.projectRole.user.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{task.projectRole.role.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-600 font-medium' : ''}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(task.status)}
                    </TableCell>
                    <TableCell>
                      <Link href={`/tasks/${task.id}`}>
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
    </div>
  );
}
