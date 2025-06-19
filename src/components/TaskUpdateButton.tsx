"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskUpdateButtonProps {
  taskId: number;
  currentStatus: string;
  onUpdate?: () => void;
}

export default function TaskUpdateButton({ taskId, currentStatus, onUpdate }: TaskUpdateButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusSelect, setShowStatusSelect] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        setShowStatusSelect(false);
        if (onUpdate) {
          onUpdate();
        } else {
          // Refresh the page if no callback provided
          window.location.reload();
        }
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch {
      alert('An error occurred while updating the task');
    } finally {
      setIsUpdating(false);
    }
  };

  if (showStatusSelect) {
    return (
      <div className="flex gap-2 items-center">
        <Select onValueChange={handleStatusUpdate} disabled={isUpdating}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODO">To Do</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowStatusSelect(false)}
          disabled={isUpdating}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => setShowStatusSelect(true)}
      disabled={isUpdating}
    >
      {isUpdating ? 'Updating...' : 'Update'}
    </Button>
  );
}
