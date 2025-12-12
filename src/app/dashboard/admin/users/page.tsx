"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAllUsers, updateUser, deleteUser } from "@/actions/admin";
import { useAlert } from "@/components/AlertProvider";
import type { UserProfile, UserRole } from "@/types/admin";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { Loader } from "@/components/Loader";
import {
  ArrowLeft,
  Users,
  Search,
  Edit,
  Trash2,
  Shield,
  User,
  GraduationCap,
} from "lucide-react";

export default function UserManagementPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    school_id: "",
    role: "student" as UserRole,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchQuery, roleFilter]);

  const loadUsers = async () => {
    try {
      const result = await getAllUsers();
      if (result.success && result.data) {
        setUsers(result.data);
        setFilteredUsers(result.data);
      } else {
        showAlert({
          message: result.error || "Failed to load users",
          type: "error",
          duration: 5000,
        });
      }
    } catch {
      showAlert({
        message: "An unexpected error occurred",
        type: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.school_id?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleEditClick = (user: UserProfile) => {
    setSelectedUser(user);
    setEditFormData({
      full_name: user.full_name,
      school_id: user.school_id || "",
      role: user.role,
    });
    setShowEditDialog(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedUser) return;

    if (!editFormData.full_name.trim()) {
      showAlert({
        message: "Full name is required",
        type: "error",
        duration: 5000,
      });
      return;
    }

    try {
      setProcessing(true);
      const result = await updateUser(selectedUser.id, {
        full_name: editFormData.full_name,
        school_id: editFormData.school_id || undefined,
        role: editFormData.role,
      });

      if (result.success) {
        showAlert({
          message: "User updated successfully!",
          type: "success",
          duration: 5000,
        });
        setShowEditDialog(false);
        setSelectedUser(null);
        await loadUsers();
      } else {
        showAlert({
          message: result.error || "Failed to update user",
          type: "error",
          duration: 5000,
        });
      }
    } catch {
      showAlert({
        message: "An unexpected error occurred",
        type: "error",
        duration: 5000,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteClick = (user: UserProfile) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      setProcessing(true);
      const result = await deleteUser(selectedUser.id);

      if (result.success) {
        showAlert({
          message: "User deleted successfully!",
          type: "success",
          duration: 5000,
        });
        setShowDeleteDialog(false);
        setSelectedUser(null);
        await loadUsers();
      } else {
        showAlert({
          message: result.error || "Failed to delete user",
          type: "error",
          duration: 5000,
        });
      }
    } catch {
      showAlert({
        message: "An unexpected error occurred",
        type: "error",
        duration: 5000,
      });
    } finally {
      setProcessing(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "psg_member":
        return <Users className="w-4 h-4" />;
      default:
        return <GraduationCap className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return { bg: "var(--error-20)", text: "var(--error)" };
      case "psg_member":
        return { bg: "var(--primary-20)", text: "var(--primary)" };
      default:
        return { bg: "var(--success-20)", text: "var(--success)" };
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading users..." />;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <DashboardNavbar subtitle="User account management" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mb-6 transition-colors"
          style={{ color: "var(--primary)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1
              className="text-lg font-bold mb-2"
              style={{ color: "var(--text)" }}
            >
              User Management
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              Manage system users, roles, and permissions
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{
              background: "var(--bg-light)",
              border: "1px solid var(--border-muted)",
              color: "var(--text)",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div
          className="p-4 rounded-lg mb-6"
          style={{
            background: "var(--bg-light)",
            border: "1px solid var(--border-muted)",
          }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                placeholder="Search by name, email, or student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border-muted)",
                  color: "var(--text)",
                }}
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value as UserRole | "all")
              }
              className="px-4 py-2 rounded-lg"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border-muted)",
                color: "var(--text)",
              }}
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="psg_member">PSG Members</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          <div
            className="mt-3 flex flex-wrap items-center gap-4 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <span>Total: {filteredUsers.length}</span>
            <span>
              Students:{" "}
              {filteredUsers.filter((u) => u.role === "student").length}
            </span>
            <span>
              PSG Members:{" "}
              {filteredUsers.filter((u) => u.role === "psg_member").length}
            </span>
            <span>
              Admins: {filteredUsers.filter((u) => u.role === "admin").length}
            </span>
          </div>
        </div>

        {/* Users Table */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: "var(--bg-light)",
            border: "1px solid var(--border-muted)",
          }}
        >
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <User
                className="w-12 h-12 mx-auto mb-4"
                style={{ color: "var(--text-muted)" }}
              />
              <p
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--text)" }}
              >
                No Users Found
              </p>
              <p style={{ color: "var(--text-muted)" }}>
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      background: "var(--bg)",
                      borderBottom: "1px solid var(--border-muted)",
                    }}
                  >
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      User
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Email
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Student ID
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Role
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Joined
                    </th>
                    <th
                      className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, idx) => (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom:
                          idx < filteredUsers.length - 1
                            ? "1px solid var(--border-muted)"
                            : "none",
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ background: "var(--bg)" }}
                          >
                            <User
                              className="w-5 h-5"
                              style={{ color: "var(--text-muted)" }}
                            />
                          </div>
                          <div>
                            <div
                              className="font-medium"
                              style={{ color: "var(--text)" }}
                            >
                              {user.full_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {user.email}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {user.school_id || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: getRoleColor(user.role).bg,
                            color: getRoleColor(user.role).text,
                          }}
                        >
                          {getRoleIcon(user.role)}
                          {user.role.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
                            style={{ background: "var(--primary-20)" }}
                            title="Edit user"
                          >
                            <Edit
                              className="w-4 h-4"
                              style={{ color: "var(--primary)" }}
                            />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 rounded-lg hover:bg-opacity-80 transition-all"
                            style={{ background: "var(--error-20)" }}
                            title="Delete user"
                          >
                            <Trash2
                              className="w-4 h-4"
                              style={{ color: "var(--error)" }}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        {showEditDialog && selectedUser && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
          >
            <div
              className="rounded-lg p-6 max-w-md w-full"
              style={{
                background: "var(--bg-light)",
                border: "1px solid var(--border-muted)",
              }}
            >
              <h3
                className="text-base font-bold mb-4"
                style={{ color: "var(--text)" }}
              >
                Edit User
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    className="block mb-2 text-sm font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.full_name}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        full_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg"
                    style={{
                      border: "1px solid var(--border-muted)",
                      background: "var(--bg)",
                      color: "var(--text)",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block mb-2 text-sm font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    Student ID (optional)
                  </label>
                  <input
                    type="text"
                    value={editFormData.school_id}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        school_id: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg"
                    style={{
                      border: "1px solid var(--border-muted)",
                      background: "var(--bg)",
                      color: "var(--text)",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block mb-2 text-sm font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    Role
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        role: e.target.value as UserRole,
                      })
                    }
                    className="w-full px-4 py-2 rounded-lg"
                    style={{
                      border: "1px solid var(--border-muted)",
                      background: "var(--bg)",
                      color: "var(--text)",
                    }}
                  >
                    <option value="student">Student</option>
                    <option value="psg_member">PSG Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleEditSubmit}
                  disabled={processing}
                  className="flex-1 px-6 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                  style={{
                    background: "var(--primary)",
                    color: "var(--bg-dark)",
                  }}
                >
                  {processing ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => {
                    setShowEditDialog(false);
                    setSelectedUser(null);
                  }}
                  disabled={processing}
                  className="px-6 py-2 rounded-lg transition-all"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border-muted)",
                    color: "var(--text)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Dialog */}
        {showDeleteDialog && selectedUser && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}
          >
            <div
              className="rounded-lg p-6 max-w-md w-full"
              style={{
                background: "var(--bg-light)",
                border: "1px solid var(--border-muted)",
              }}
            >
              <h3
                className="text-base font-bold mb-4"
                style={{ color: "var(--text)" }}
              >
                Delete User
              </h3>
              <p className="mb-4" style={{ color: "var(--text-muted)" }}>
                Are you sure you want to delete{" "}
                <strong>{selectedUser.full_name}</strong>? This action cannot be
                undone and will remove all associated data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteConfirm}
                  disabled={processing}
                  className="flex-1 px-6 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                  style={{
                    background: "var(--error)",
                    color: "var(--bg-dark)",
                  }}
                >
                  {processing ? "Deleting..." : "Delete User"}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setSelectedUser(null);
                  }}
                  disabled={processing}
                  className="px-6 py-2 rounded-lg transition-all"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--border-muted)",
                    color: "var(--text)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
