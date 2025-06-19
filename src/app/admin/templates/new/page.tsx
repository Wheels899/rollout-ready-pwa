"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Role {
  id: number;
  name: string;
  description: string;
}

interface TemplateTask {
  description: string;
  offsetDays: number;
  isRecurring: boolean;
  isCritical: boolean;
}

export default function NewTemplatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    roleId: "",
    autoAssign: false,
  });
  const [tasks, setTasks] = useState<TemplateTask[]>([]);
  const [newTask, setNewTask] = useState<TemplateTask>({
    description: "",
    offsetDays: 0,
    isRecurring: false,
    isCritical: false,
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles");
      if (response.ok) {
        const rolesData = await response.json();
        setRoles(rolesData);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const templateData = {
        ...formData,
        roleId: parseInt(formData.roleId),
        tasks,
      };

      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        router.push("/admin/templates");
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch {
      alert("An error occurred while creating the template");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const addTask = () => {
    if (newTask.description.trim()) {
      setTasks([...tasks, { ...newTask }]);
      setNewTask({
        description: "",
        offsetDays: 0,
        isRecurring: false,
        isCritical: false,
      });
    }
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleNewTaskChange = (field: keyof TemplateTask, value: string | number | boolean) => {
    setNewTask({
      ...newTask,
      [field]: value,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Template</h1>
        <p className="text-gray-600 mt-2">
          Create a reusable task template for a specific role
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Template Details */}
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
            <CardDescription>
              Basic information about the template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Project Manager Checklist"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleId">Role *</Label>
              <Select value={formData.roleId} onValueChange={(value) => setFormData({...formData, roleId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of this template"
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoAssign"
                name="autoAssign"
                checked={formData.autoAssign}
                onChange={handleChange}
                className="rounded border-gray-300"
              />
              <Label htmlFor="autoAssign">Auto-assign when role is added to project</Label>
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Template Tasks</CardTitle>
            <CardDescription>
              Add tasks that will be created when this template is used
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Task */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-4">Add New Task</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Task Description *</Label>
                  <Input
                    value={newTask.description}
                    onChange={(e) => handleNewTaskChange('description', e.target.value)}
                    placeholder="e.g., Create project charter and scope document"
                  />
                </div>
                <div>
                  <Label>Offset Days</Label>
                  <Input
                    type="number"
                    value={newTask.offsetDays}
                    onChange={(e) => handleNewTaskChange('offsetDays', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Days from project start (negative for pre-start)</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newTask.isCritical}
                      onChange={(e) => handleNewTaskChange('isCritical', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label>Critical Task</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newTask.isRecurring}
                      onChange={(e) => handleNewTaskChange('isRecurring', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label>Recurring Task</Label>
                  </div>
                </div>
              </div>
              <Button type="button" onClick={addTask} className="mt-4" disabled={!newTask.description.trim()}>
                Add Task
              </Button>
            </div>

            {/* Task List */}
            {tasks.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4">Template Tasks ({tasks.length})</h3>
                <div className="space-y-2">
                  {tasks.map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{task.description}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">
                            {task.offsetDays >= 0 ? `T+${task.offsetDays}` : `T${task.offsetDays}`} days
                          </Badge>
                          {task.isCritical && <Badge variant="destructive">Critical</Badge>}
                          {task.isRecurring && <Badge variant="secondary">Recurring</Badge>}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTask(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading || !formData.roleId || tasks.length === 0}>
            {isLoading ? "Creating..." : "Create Template"}
          </Button>
          <Link href="/admin/templates">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
