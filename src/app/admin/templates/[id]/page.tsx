import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import TemplateDetailClient from "@/components/admin/TemplateDetailClient";

interface TemplateDetailProps {
  params: Promise<{
    id: string;
  }>;
}

async function getTemplate(id: number) {
  return await prisma.template.findUnique({
    where: { id },
    include: {
      role: true,
      templateTasks: {
        orderBy: { offsetDays: 'asc' },
      },
      _count: {
        select: {
          templateTasks: true,
        },
      },
    },
  });
}

export default async function TemplateDetailPage({ params }: TemplateDetailProps) {
  const resolvedParams = await params;
  const templateId = parseInt(resolvedParams.id);

  if (isNaN(templateId)) {
    notFound();
  }

  const template = await getTemplate(templateId);

  if (!template) {
    notFound();
  }

  return <TemplateDetailClient template={template} />;
}
