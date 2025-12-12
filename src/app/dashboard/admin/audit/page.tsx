"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAuditLogs } from "@/actions/admin";
import { useAlert } from "@/components/AlertProvider";
import type { AuditLog } from "@/types/admin";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { Loader } from "@/components/Loader";
import {
  ArrowLeft,
  Shield,
  Search,
  Filter,
  FileText,
  RefreshCw,
} from "lucide-react";

export default function AuditLogsPage() {
  const { showAlert } = useAlert();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [tableFilter, setTableFilter] = useState<string>("all");
  const [limit, setLimit] = useState(100);

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  useEffect(() => {
    filterLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs, searchQuery, actionFilter, tableFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const result = await getAuditLogs(limit);
      if (result.success && result.data) {
        setLogs(result.data);
        setFilteredLogs(result.data);
      } else {
        showAlert({
          message: result.error || "Failed to load audit logs",
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

  const filterLogs = () => {
    let filtered = logs;

    if (actionFilter !== "all") {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    if (tableFilter !== "all") {
      filtered = filtered.filter((log) => log.table_name === tableFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.user_name.toLowerCase().includes(query) ||
          log.user_email.toLowerCase().includes(query) ||
          log.action.toLowerCase().includes(query) ||
          log.table_name.toLowerCase().includes(query)
      );
    }

    setFilteredLogs(filtered);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "INSERT":
        return { bg: "var(--success-20)", text: "var(--success)" };
      case "UPDATE":
        return { bg: "var(--primary-20)", text: "var(--primary)" };
      case "DELETE":
        return { bg: "var(--error-20)", text: "var(--error)" };
      default:
        return { bg: "var(--text-muted)", text: "var(--text)" };
    }
  };

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action)));
  const uniqueTables = Array.from(new Set(logs.map((log) => log.table_name)));

  if (loading) {
    return <Loader fullScreen text="Loading audit logs..." />;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <DashboardNavbar subtitle="System activity tracking" />

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
              Audit Logs
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              Track system activities and data changes
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
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5" style={{ color: "var(--primary)" }} />
            <h3 className="font-semibold" style={{ color: "var(--text)" }}>
              Filters
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                placeholder="Search logs..."
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

            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-4 py-2 rounded-lg"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border-muted)",
                color: "var(--text)",
              }}
            >
              <option value="all">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>

            {/* Table Filter */}
            <select
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              className="px-4 py-2 rounded-lg"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border-muted)",
                color: "var(--text)",
              }}
            >
              <option value="all">All Tables</option>
              {uniqueTables.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>

            {/* Limit */}
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-4 py-2 rounded-lg"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border-muted)",
                color: "var(--text)",
              }}
            >
              <option value="50">Last 50</option>
              <option value="100">Last 100</option>
              <option value="250">Last 250</option>
              <option value="500">Last 500</option>
            </select>
          </div>

          <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div
              className="flex flex-wrap items-center gap-4 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              <span>Total: {filteredLogs.length}</span>
              <span>
                Inserts:{" "}
                {filteredLogs.filter((l) => l.action === "INSERT").length}
              </span>
              <span>
                Updates:{" "}
                {filteredLogs.filter((l) => l.action === "UPDATE").length}
              </span>
              <span>
                Deletes:{" "}
                {filteredLogs.filter((l) => l.action === "DELETE").length}
              </span>
            </div>

            <button
              onClick={loadLogs}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:opacity-90 transition-all"
              style={{
                background: "var(--primary-20)",
                color: "var(--primary)",
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: "var(--bg-light)",
            border: "1px solid var(--border-muted)",
          }}
        >
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText
                className="w-12 h-12 mx-auto mb-4"
                style={{ color: "var(--text-muted)" }}
              />
              <p
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--text)" }}
              >
                No Audit Logs Found
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
                      Timestamp
                    </th>
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
                      Action
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Table
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Record ID
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, idx) => (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom:
                          idx < filteredLogs.length - 1
                            ? "1px solid var(--border-muted)"
                            : "none",
                      }}
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div
                            className="font-medium text-sm"
                            style={{ color: "var(--text)" }}
                          >
                            {log.user_name}
                          </div>
                          <div
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {log.user_email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: getActionColor(log.action).bg,
                            color: getActionColor(log.action).text,
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-mono"
                        style={{ color: "var(--text)" }}
                      >
                        {log.table_name}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-mono"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {log.record_id ? log.record_id.substring(0, 8) : "N/A"}
                      </td>
                      <td
                        className="px-6 py-4 max-w-xs truncate text-sm"
                        style={{ color: "var(--text-muted)" }}
                        title={JSON.stringify(log.details, null, 2)}
                      >
                        {log.details ? JSON.stringify(log.details) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div
          className="mt-6 p-4 rounded-lg"
          style={{
            background: "var(--primary-20)",
            border: "1px solid var(--primary)",
          }}
        >
          <div className="flex items-start gap-3">
            <Shield
              className="w-5 h-5 mt-0.5"
              style={{ color: "var(--primary)" }}
            />
            <div>
              <h4
                className="font-semibold mb-1"
                style={{ color: "var(--text)" }}
              >
                About Audit Logs
              </h4>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Audit logs automatically track all database changes including
                inserts, updates, and deletes. Each entry records the user who
                made the change, the affected table and record, and details
                about the modification. This provides a complete audit trail for
                compliance and security purposes.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
