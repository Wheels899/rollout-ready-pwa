"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UserPicker from "@/components/UserPicker";

interface ProjectEditProps {
  params: Promise<{
    id: string;
  }>;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  startDate: string;
  projectRoles: {
    id: number;
    roleId: number;
    userId: number;
    role: Role;
    user: {
      id: number;
      username: string;
      firstName?: string;
      lastName?: string;
    };
  }[];
}

export default function ProjectEditPage({ params }: ProjectEditProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
  });
  const [roleAssignments, setRoleAssignments] = useState<Record<number, number | undefined>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    loadProjectData();
  }, []);

  const loadProjectData = async () => {
    try {
      const resolvedParams = await params;
      const projectId = parseInt(resolvedParams.id);

      if (isNaN(projectId)) {
        setError("Invalid project ID");
        return;
      }

      // Load project data
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      if (!projectResponse.ok) {
        setError("Project not found");
        return;
      }

      const projectData = await projectResponse.json();
      setProject(projectData);

      // Set form data
      setFormData({
        name: projectData.name,
        description: projectData.description || "",
        startDate: projectData.startDate.split('T')[0], // Format for date input
      });

      // Set current role assignments
      const assignments: Record<number, number | undefined> = {};
      projectData.projectRoles.forEach((pr: any) => {
        assignments[pr.roleId] = pr.userId;
      });
      setRoleAssignments(assignments);

      // Load roles
      const rolesResponse = await fetch("/api/roles");
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setRoles(rolesData);
      }
    } catch (err) {
      setError("Failed to load project data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setIsLoading(true);
    setError("");

    try {
      const updateData = {
        ...formData,
        roleAssignments,
      };

      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        router.push(`/admin/projects/${project.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update project");
      }
    } catch (err) {
      setError("An error occurred while updating the project");
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

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Error</h1>
          <p className="text-red-600 mt-2">{error}</p>
          <Link href="/admin">
            <Button className="mt-4">Back to Admin</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Project: {project.name}</h1>
        <p className="text-gray-600 mt-2">
          Modify project details and team assignments
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Update basic project information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

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
              Assign team members to project roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roles.length === 0 ? (
              <p className="text-gray-500">Loading roles...</p>
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
            {isLoading ? "Updating..." : "Update Project"}
          </Button>
          <Link href={`/admin/projects/${project.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
