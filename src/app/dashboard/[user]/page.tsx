import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";
import TaskUpdateButton from "@/components/TaskUpdateButton";

interface UserDashboardProps {
  params: Promise<{
    user: string;
  }>;
}

async function getUserTasks(userName: string) {
  return await prisma.projectTask.findMany({
    where: {
      projectRole: {
        user: {
          username: userName,
        },
      },
    },
    include: {
      project: true,
      projectRole: {
        include: {
          role: true,
          user: true,
        },
      },
      templateTask: {
        select: {
          isRecurring: true,
          isCritical: true,
        },
      },
    },
    orderBy: [
      { dueDate: 'asc' },
      { createdAt: 'desc' },
    ],
  });
}

async function getUserProjects(userName: string) {
  return await prisma.project.findMany({
    where: {
      projectRoles: {
        some: {
          user: {
            username: userName,
          },
        },
      },
    },
    include: {
      projectRoles: {
        where: {
          user: {
            username: userName,
          },
        },
        include: {
          role: true,
          user: true,
        },
      },
      _count: {
        select: {
          projectTasks: {
            where: {
              projectRole: {
                user: {
                  username: userName,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { startDate: 'desc' },
  });
}

async function getTaskStats(userName: string) {
  const tasks = await getUserTasks(userName);
  const projects = await getUserProjects(userName);

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
    overdue: tasks.filter(t => t.status !== 'DONE' && new Date(t.dueDate) < new Date()).length,
    critical: tasks.filter(t => t.templateTask?.isCritical && t.status !== 'DONE').length,
    projects: projects.length,
  };

  return { tasks, stats, projects };
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'TODO':
      return <Badge variant="secondary">To Do</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="default">In Progress</Badge>;
    case 'DONE':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Done</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function isOverdue(dueDate: Date, status: string) {
  return status !== 'DONE' && new Date(dueDate) < new Date();
}

export default async function UserDashboard({ params }: UserDashboardProps) {
  const resolvedParams = await params;
  const userName = decodeURIComponent(resolvedParams.user);
  const { tasks, stats, projects } = await getTaskStats(userName);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 capitalize">
          {userName}&apos;s Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Your assigned tasks across all projects
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.done}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.projects}</div>
          </CardContent>
        </Card>
      </div>

      {/* My Projects */}
      <Card>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
          <CardDescription>
            Projects where you have assigned roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No projects assigned yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {project.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Your Role:</span>
                        <Badge variant="outline">
                          {project.projectRoles[0]?.role.name}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Your Tasks:</span>
                        <span className="font-medium">{project._count.projectTasks}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Start Date:</span>
                        <span>{new Date(project.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Tasks</CardTitle>
          <CardDescription>
            All tasks assigned to you across projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No tasks assigned yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className={isOverdue(task.dueDate, task.status) ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/tasks/${task.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {task.description}
                        </a>
                        {task.templateTask?.isCritical && (
                          <Badge variant="destructive" className="text-xs">
                            Critical
                          </Badge>
                        )}
                        {isOverdue(task.dueDate, task.status) && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{task.project.name}</TableCell>
                    <TableCell>{task.projectRole.role.name}</TableCell>
                    <TableCell>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(task.status)}
                    </TableCell>
                    <TableCell>
                      <TaskUpdateButton
                        taskId={task.id}
                        currentStatus={task.status}
                      />
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
