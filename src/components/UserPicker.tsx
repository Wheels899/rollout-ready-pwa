"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  systemRole: string;
  jobRoleId?: number;
  jobRole?: {
    id: number;
    name: string;
    description?: string;
  };
  isActive: boolean;
}

interface UserPickerProps {
  value?: number;
  onValueChange: (userId: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  excludeUserIds?: number[];
  projectRoleName?: string; // Filter users based on project role
}

export default function UserPicker({
  value,
  onValueChange,
  placeholder = "Select a user",
  disabled = false,
  excludeUserIds = [],
  projectRoleName
}: UserPickerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [projectRoleName, excludeUserIds]);

  // Filter users based on project role name - should match job role
  const shouldIncludeUser = (user: User, projectRoleName: string): boolean => {
    // If user has a job role, it should match the project role name
    if (user.jobRole) {
      return user.jobRole.name.toLowerCase() === projectRoleName.toLowerCase();
    }

    // If user has no job role, fall back to system role filtering for backward compatibility
    const roleName = projectRoleName.toLowerCase();
    if (roleName.includes('manager') || roleName.includes('lead') || roleName.includes('director')) {
      return ['MANAGER', 'ADMIN'].includes(user.systemRole);
    }

    // For specialist roles, allow USER system role users without specific job roles
    return user.systemRole === 'USER';
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();

        // Filter users based on active status, exclusions, and role matching
        let filteredUsers = data.filter((user: User) =>
          user.isActive && !excludeUserIds.includes(user.id)
        );

        // Apply role filtering if projectRoleName is provided
        if (projectRoleName) {
          filteredUsers = filteredUsers.filter((user: User) =>
            shouldIncludeUser(user, projectRoleName)
          );
        }

        setUsers(filteredUsers);
      } else {
        setError("Failed to load users");
      }
    } catch (err) {
      setError("Error loading users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueChange = (stringValue: string) => {
    if (stringValue === "none") {
      onValueChange(undefined);
    } else {
      const userId = parseInt(stringValue);
      onValueChange(userId);
    }
  };

  const getDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName} (@${user.username})`;
    }
    return `@${user.username}`;
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'MANAGER':
        return 'default';
      case 'USER':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading users..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (error) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder={error} />
        </SelectTrigger>
      </Select>
    );
  }

  // Get appropriate placeholder text
  const getPlaceholderText = () => {
    if (projectRoleName) {
      return `Select user for ${projectRoleName} role`;
    }
    return placeholder;
  };

  return (
    <Select 
      value={value ? value.toString() : "none"} 
      onValueChange={handleValueChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={getPlaceholderText()} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <span className="text-gray-500">No user assigned</span>
        </SelectItem>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id.toString()}>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <span>{getDisplayName(user)}</span>
                {user.jobRole && (
                  <span className="text-xs text-gray-500">{user.jobRole.name}</span>
                )}
              </div>
              <div className="flex gap-1">
                {user.jobRole && (
                  <Badge variant="outline" className="text-xs">
                    {user.jobRole.name}
                  </Badge>
                )}
                <Badge
                  variant={getRoleBadgeVariant(user.systemRole)}
                  className="text-xs"
                >
                  {user.systemRole}
                </Badge>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
