import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/attachments/[id] - Download attachment
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const attachmentId = parseInt(resolvedParams.id);
    
    if (isNaN(attachmentId)) {
      return NextResponse.json(
        { message: "Invalid attachment ID" },
        { status: 400 }
      );
    }

    // Get attachment record
    const attachment = await prisma.taskAttachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      return NextResponse.json(
        { message: "Attachment not found" },
        { status: 404 }
      );
    }

    // Check if file exists on disk
    const filePath = join(process.cwd(), 'uploads', 'tasks', attachment.fileName);
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { message: "File not found on disk" },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = await readFile(filePath);

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': attachment.mimeType,
        'Content-Disposition': `attachment; filename="${attachment.originalName}"`,
        'Content-Length': attachment.fileSize.toString(),
      },
    });

  } catch (error) {
    console.error("Error downloading attachment:", error);
    return NextResponse.json(
      { message: "Failed to download attachment" },
      { status: 500 }
    );
  }
}

// DELETE /api/attachments/[id] - Delete attachment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const attachmentId = parseInt(resolvedParams.id);
    
    if (isNaN(attachmentId)) {
      return NextResponse.json(
        { message: "Invalid attachment ID" },
        { status: 400 }
      );
    }

    // Get attachment record
    const attachment = await prisma.taskAttachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      return NextResponse.json(
        { message: "Attachment not found" },
        { status: 404 }
      );
    }

    // Delete file from disk (optional - you might want to keep files for audit)
    const filePath = join(process.cwd(), 'uploads', 'tasks', attachment.fileName);
    if (existsSync(filePath)) {
      const { unlink } = await import('fs/promises');
      await unlink(filePath);
    }

    // Delete attachment record
    await prisma.taskAttachment.delete({
      where: { id: attachmentId },
    });

    return NextResponse.json({
      message: "Attachment deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting attachment:", error);
    return NextResponse.json(
      { message: "Failed to delete attachment" },
      { status: 500 }
    );
  }
}
