"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Clock, MessageSquare, Save } from "lucide-react";
import { useRouter } from "next/navigation";

interface TaskDetailFormProps {
  task: {
    id: number;
    status: string;
    comments: string | null;
    timeSpentMinutes: number | null;
    projectRole: {
      user: {
        username: string;
      };
    };
  };
}

export default function TaskDetailForm({ task }: TaskDetailFormProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form states
  const [status, setStatus] = useState(task.status);
  const [comments, setComments] = useState(task.comments || '');
  const [timeSpentHours, setTimeSpentHours] = useState(
    task.timeSpentMinutes ? Math.floor(task.timeSpentMinutes / 60).toString() : ''
  );
  const [timeSpentMinutes, setTimeSpentMinutes] = useState(
    task.timeSpentMinutes ? (task.timeSpentMinutes % 60).toString() : ''
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleTaskUpdate = async () => {
    setIsUpdating(true);
    
    try {
      const totalMinutes = (parseInt(timeSpentHours) || 0) * 60 + (parseInt(timeSpentMinutes) || 0);
      
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          comments: comments.trim() || null,
          timeSpentMinutes: totalMinutes > 0 ? totalMinutes : null,
          completedAt: status === 'DONE' ? new Date().toISOString() : null,
        }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('An error occurred while updating the task');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('uploadedBy', task.projectRole.user.username);
      
      const response = await fetch(`/api/tasks/${task.id}/attachments`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        router.refresh();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      alert('An error occurred while uploading the file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Task Status Update */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Update Task
          </CardTitle>
          <CardDescription>
            Change task status, add comments, and record time spent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Task Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Tracking */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Spent
            </Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Hours"
                  value={timeSpentHours}
                  onChange={(e) => setTimeSpentHours(e.target.value)}
                  min="0"
                  max="999"
                />
                <Label className="text-xs text-gray-500 mt-1">Hours</Label>
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Minutes"
                  value={timeSpentMinutes}
                  onChange={(e) => setTimeSpentMinutes(e.target.value)}
                  min="0"
                  max="59"
                />
                <Label className="text-xs text-gray-500 mt-1">Minutes</Label>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments / Notes
            </Label>
            <Textarea
              id="comments"
              placeholder="Add any comments, notes, or updates about this task..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={handleTaskUpdate} 
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? 'Updating...' : 'Update Task'}
          </Button>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Attachment
          </CardTitle>
          <CardDescription>
            Upload files as proof of completion or supporting documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <Input
              id="file-upload"
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xlsx,.xls,.ppt,.pptx"
            />
            <p className="text-xs text-gray-500">
              Supported formats: PDF, Word, Excel, PowerPoint, Images, Text files (Max 10MB)
            </p>
          </div>

          {selectedFile && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">Selected file:</p>
              <p className="text-sm text-gray-600">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          )}

          <Button 
            onClick={handleFileUpload} 
            disabled={!selectedFile || isUploading}
            className="w-full"
            variant="outline"
          >
            {isUploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
