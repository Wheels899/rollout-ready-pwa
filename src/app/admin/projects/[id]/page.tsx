import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProjectDetailClient from "@/components/admin/ProjectDetailClient";

interface ProjectDetailProps {
  params: Promise<{
    id: string;
  }>;
}

async function getProject(id: number) {
  return await prisma.project.findUnique({
    where: { id },
    include: {
      projectRoles: {
        include: {
          role: true,
          user: true,
        },
      },
      projectTasks: {
        include: {
          projectRole: {
            include: {
              role: true,
            user: true,
            },
          },
          templateTask: true,
        },
        orderBy: [
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
      },
      _count: {
        select: {
          projectTasks: true,
        },
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

export async function generateMetadata({ params }: ProjectDetailProps): Promise<Metadata> {
  const resolvedParams = await params;
  const projectId = parseInt(resolvedParams.id);

  if (isNaN(projectId)) {
    return { title: 'Project Not Found - Rollout Ready' };
  }

  const project = await getProject(projectId);

  if (!project) {
    return { title: 'Project Not Found - Rollout Ready' };
  }

  return {
    title: `${project.name} - Rollout Ready`,
    description: project.description || `Project details for ${project.name}`,
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailProps) {
  const resolvedParams = await params;
  const projectId = parseInt(resolvedParams.id);

  if (isNaN(projectId)) {
    notFound();
  }

  const project = await getProject(projectId);

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient project={project} />;
}
