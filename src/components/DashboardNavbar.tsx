"use client";

import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { ThemeToggler } from "@/components/ThemeToggler";
import { Home } from "lucide-react";

interface DashboardNavbarProps {
  title?: string;
  subtitle?: string;
  showHomeButton?: boolean;
}

export function DashboardNavbar({
  title = "CareConnect",
  subtitle,
  showHomeButton = false,
}: DashboardNavbarProps) {
  const router = useRouter();

  return (
    <header
      style={{
        background: "var(--bg-dark)",
        boxShadow: "0 2px 16px 0 var(--border-muted)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--primary)" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="text-xs hidden sm:block"
                style={{ color: "var(--text-muted)" }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {showHomeButton && (
            <>
              <div
                className="h-6 w-px hidden sm:block"
                style={{ background: "var(--border-muted)" }}
              />
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 rounded-md transition hover:bg-primary flex items-center gap-2"
                style={{ color: "var(--text)" }}
                title="Back to Dashboard"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--bg-dark)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text)";
                }}
              >
                <Home className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:inline">
                  Home
                </span>
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggler />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
