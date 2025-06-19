"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import PageHeader from "@/components/PageHeader";
import Breadcrumb from "@/components/Breadcrumb";

interface Role {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  systemRole: string;
  jobRoleId: number | null;
  isActive: boolean;
}

interface UserEditProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditUserPage({ params }: UserEditProps) {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    systemRole: "USER",
    jobRoleId: "none",
    isActive: true,
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Resolve params and set userId
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      const id = parseInt(resolvedParams.id);
      if (isNaN(id)) {
        notFound();
      }
      setUserId(id);
    };
    resolveParams();
  }, [params]);

  // Fetch user data and roles
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch(`/api/users/${userId}`);
        if (!userResponse.ok) {
          if (userResponse.status === 404) {
            notFound();
          }
          throw new Error("Failed to fetch user");
        }
        const userData = await userResponse.json();
        setUser(userData);

        // Set form data
        setFormData({
          username: userData.username || "",
          email: userData.email || "",
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          systemRole: userData.systemRole || "USER",
          jobRoleId: userData.jobRoleId ? userData.jobRoleId.toString() : "none",
          isActive: userData.isActive ?? true,
        });

        // Fetch roles
        const rolesResponse = await fetch("/api/roles");
        if (rolesResponse.ok) {
          const rolesData = await rolesResponse.json();
          setRoles(rolesData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load user data");
      }
    };

    fetchData();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSystemRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      systemRole: value
    }));
  };

  const handleJobRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      jobRoleId: value
    }));
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isActive: checked
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordError("");
  };

  const handlePasswordReset = async () => {
    if (!userId) return;

    // Validation
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setPasswordError("");

    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordData({ newPassword: "", confirmPassword: "" });
        setShowPasswordReset(false);
        alert("Password reset successfully! The user can now login with the new password.");
      } else {
        setPasswordError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setPasswordError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRandomPassword = async () => {
    if (!userId) return;

    setIsLoading(true);
    setPasswordError("");

    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generateRandom: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordData({ newPassword: "", confirmPassword: "" });
        setShowPasswordReset(false);
        alert(`Password reset successfully!\n\nTemporary Password: ${data.temporaryPassword}\n\nPlease share this password securely with the user. They should change it after first login.`);
      } else {
        setPasswordError(data.message || "Failed to generate password");
      }
    } catch (err) {
      setPasswordError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName || null,
          lastName: formData.lastName || null,
          systemRole: formData.systemRole,
          jobRoleId: formData.jobRoleId === "none" ? null : parseInt(formData.jobRoleId),
          isActive: formData.isActive,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/admin/users/${userId}`);
      } else {
        setError(data.message || "Failed to update user");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to deactivate the user "${user.username}"? This will set their account to inactive.`)) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/users");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to deactivate user");
      }
    } catch (err) {
      setError("An error occurred while deactivating the user");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const userDisplayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.username;

  return (
    <div className="space-y-8">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/users" },
          { label: userDisplayName, href: `/admin/users/${userId}` },
          { label: "Edit" },
        ]}
      />
      
      <PageHeader
        title={`Edit User: ${userDisplayName}`}
        description="Update user information and permissions"
        backUrl={`/admin/users/${userId}`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Update user details and credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systemRole">System Role *</Label>
                <Select value={formData.systemRole} onValueChange={handleSystemRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a system role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User - Can view and update assigned tasks</SelectItem>
                    <SelectItem value="MANAGER">Manager - Can create projects and assign users</SelectItem>
                    <SelectItem value="ADMIN">Admin - Full system access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobRole">Job Role</Label>
                <Select value={formData.jobRoleId} onValueChange={handleJobRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job role (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific job role</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                        {role.description && ` - ${role.description}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Job role determines which project roles this user can be assigned to
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleActiveChange}
              />
              <Label htmlFor="isActive">Account is active</Label>
            </div>
          </CardContent>
        </Card>

        {/* Password Reset Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Password Management
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordReset(!showPasswordReset)}
              >
                {showPasswordReset ? "Cancel" : "Reset Password"}
              </Button>
            </CardTitle>
            <CardDescription>
              Reset the user's password. The user will need to use the new password to login.
            </CardDescription>
          </CardHeader>

          {showPasswordReset && (
            <CardContent className="space-y-4">
              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {passwordError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password *</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500">Minimum 6 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={isLoading || !passwordData.newPassword || !passwordData.confirmPassword}
                  variant="destructive"
                >
                  {isLoading ? "Resetting..." : "Set Password"}
                </Button>
                <Button
                  type="button"
                  onClick={handleGenerateRandomPassword}
                  disabled={isLoading}
                  variant="secondary"
                >
                  {isLoading ? "Generating..." : "Generate Random Password"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordReset(false);
                    setPasswordData({ newPassword: "", confirmPassword: "" });
                    setPasswordError("");
                  }}
                >
                  Cancel
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Options:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• <strong>Set Password:</strong> Enter a specific password for the user</li>
                  <li>• <strong>Generate Random:</strong> Create a secure random password automatically</li>
                </ul>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update User"}
          </Button>
          <Link href={`/admin/users/${userId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deactivating..." : "Deactivate User"}
          </Button>
        </div>
      </form>
    </div>
  );
}
