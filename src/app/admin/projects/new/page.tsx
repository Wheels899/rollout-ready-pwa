"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UserPicker from "@/components/UserPicker";

interface Role {
  id: number;
  name: string;
  description: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
  });
  const [roleAssignments, setRoleAssignments] = useState<Record<number, number | undefined>>({});

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
      const projectData = {
        ...formData,
        roleAssignments,
      };

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        router.push("/admin");
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch {
      alert("An error occurred while creating the project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleAssignment = (roleId: number, userId: number | undefined) => {
    setRoleAssignments({
      ...roleAssignments,
      [roleId]: userId,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-gray-600 mt-2">
          Set up a new implementation project with templates and team assignments
        </p>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Project Creation Workflow:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
            <li>Define project details (name, description, start date)</li>
            <li>Assign team members to project roles</li>
            <li>System automatically applies relevant task templates</li>
            <li>Tasks are generated based on role assignments and templates</li>
          </ol>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Basic information about the project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Deploy MES at Avonmouth"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the project"
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Role Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Team Assignments</CardTitle>
            <CardDescription>
              Assign team members to project roles. Task templates will be automatically applied based on these assignments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roles.length === 0 ? (
              <p className="text-gray-500">No roles available. Please create roles first.</p>
            ) : (
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{role.name}</h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                    <div className="w-64">
                      <UserPicker
                        value={roleAssignments[role.id]}
                        onValueChange={(userId) => handleRoleAssignment(role.id, userId)}
                        placeholder={`Select user for ${role.name}`}
                        excludeUserIds={Object.values(roleAssignments).filter(id => id !== undefined && id !== roleAssignments[role.id]) as number[]}
                        projectRoleName={role.name}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
          <Link href="/admin">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
