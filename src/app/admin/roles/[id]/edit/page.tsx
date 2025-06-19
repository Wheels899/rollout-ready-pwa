"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RoleEditProps {
  params: Promise<{
    id: string;
  }>;
}

interface Role {
  id: number;
  name: string;
  description: string;
  _count: {
    templates: number;
    projectRoles: number;
  };
}

export default function RoleEditPage({ params }: RoleEditProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadRoleData();
  }, []);

  const loadRoleData = async () => {
    try {
      const resolvedParams = await params;
      const roleId = parseInt(resolvedParams.id);
      
      if (isNaN(roleId)) {
        setError("Invalid role ID");
        return;
      }

      // Load role data
      const response = await fetch(`/api/roles/${roleId}`);
      if (!response.ok) {
        setError("Role not found");
        return;
      }
      
      const roleData = await response.json();
      setRole(roleData);
      
      // Set form data
      setFormData({
        name: roleData.name,
        description: roleData.description || "",
      });
    } catch (err) {
      setError("Failed to load role data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/roles/${role.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/admin/roles/${role.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update role");
      }
    } catch (err) {
      setError("An error occurred while updating the role");
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

  const handleDelete = async () => {
    if (!role) return;
    
    if (role._count.projectRoles > 0) {
      setError("Cannot delete role that is currently used in projects");
      return;
    }

    if (!confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/roles/${role.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/roles");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete role");
      }
    } catch (err) {
      setError("An error occurred while deleting the role");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Error</h1>
          <p className="text-red-600 mt-2">{error}</p>
          <Link href="/admin/roles">
            <Button className="mt-4">Back to Roles</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!role) {
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
        <h1 className="text-3xl font-bold text-gray-900">Edit Role: {role.name}</h1>
        <p className="text-gray-600 mt-2">
          Modify role details and settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Role Details */}
        <Card>
          <CardHeader>
            <CardTitle>Role Details</CardTitle>
            <CardDescription>
              Update basic role information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Project Manager, Infrastructure Lead"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of this role's responsibilities"
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Role Usage Info */}
        <Card>
          <CardHeader>
            <CardTitle>Role Usage</CardTitle>
            <CardDescription>
              Current usage of this role in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Templates</p>
                <p className="text-2xl font-bold">{role._count.templates}</p>
                <p className="text-xs text-gray-600">Associated templates</p>
              </div>
              <div>
                <p className="text-sm font-medium">Project Usage</p>
                <p className="text-2xl font-bold">{role._count.projectRoles}</p>
                <p className="text-xs text-gray-600">Times used in projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Role"}
          </Button>
          <Link href={`/admin/roles/${role.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          {role._count.projectRoles === 0 && (
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isLoading}
            >
              Delete Role
            </Button>
          )}
        </div>
      </form>

      {role._count.projectRoles > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cannot Delete</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This role cannot be deleted because it is currently used in {role._count.projectRoles} project{role._count.projectRoles !== 1 ? 's' : ''}. 
              Remove the role from all projects before deleting it.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
