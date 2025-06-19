import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import TaskDetailForm from "@/components/TaskDetailForm";
import { ArrowLeft, Calendar, Clock, User, Building } from "lucide-react";
import Link from "next/link";

interface TaskDetailProps {
  params: Promise<{
    id: string;
  }>;
}

async function getTaskDetail(taskId: number) {
  return await prisma.projectTask.findUnique({
    where: { id: taskId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          description: true,
          startDate: true,
        },
      },
      projectRole: {
        include: {
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      templateTask: {
        select: {
          id: true,
          description: true,
          isRecurring: true,
          isCritical: true,
        },
      },
      attachments: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
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

function formatTimeSpent(minutes: number | null) {
  if (!minutes) return 'Not recorded';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} minutes`;
  if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minutes`;
}

export default async function TaskDetail({ params }: TaskDetailProps) {
  const resolvedParams = await params;
  const taskId = parseInt(resolvedParams.id);
  
  if (isNaN(taskId)) {
    notFound();
  }

  const task = await getTaskDetail(taskId);
  
  if (!task) {
    notFound();
  }

  const assignedUser = task.projectRole.user;
  const userDisplayName = assignedUser.firstName && assignedUser.lastName 
    ? `${assignedUser.firstName} ${assignedUser.lastName}`
    : assignedUser.username;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/${assignedUser.username}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Details</h1>
          <p className="text-gray-600">Manage task progress and attachments</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Task Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{task.description}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {task.project.name}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {task.projectRole.role.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(task.status)}
                  {task.templateTask?.isCritical && (
                    <Badge variant="destructive">Critical</Badge>
                  )}
                  {isOverdue(task.dueDate, task.status) && (
                    <Badge variant="destructive">Overdue</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Due Date:</span>
                  <span className={isOverdue(task.dueDate, task.status) ? 'text-red-600 font-medium' : ''}>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Time Spent:</span>
                  <span>{formatTimeSpent(task.timeSpentMinutes)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Assigned to:</span>
                  <span>{userDisplayName}</span>
                </div>
                {task.completedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Completed:</span>
                    <span>{new Date(task.completedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              {task.comments && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Comments:</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.comments}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Task Management Form */}
          <TaskDetailForm task={task} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Project Name</h4>
                <p className="text-sm text-gray-600">{task.project.name}</p>
              </div>
              {task.project.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Description</h4>
                  <p className="text-sm text-gray-600">{task.project.description}</p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium text-gray-700">Start Date</h4>
                <p className="text-sm text-gray-600">
                  {new Date(task.project.startDate).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attachments</CardTitle>
              <CardDescription>
                Files uploaded for this task
              </CardDescription>
            </CardHeader>
            <CardContent>
              {task.attachments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No attachments yet
                </p>
              ) : (
                <div className="space-y-2">
                  {task.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.originalName}</p>
                        <p className="text-xs text-gray-500">
                          {(attachment.fileSize / 1024).toFixed(1)} KB • {attachment.uploadedBy}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/api/attachments/${attachment.id}`} download>
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
