"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import { Alert } from "./Alert";

export type GlobalAlert = {
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number; // ms
};

interface AlertContextType {
  showAlert: (alert: GlobalAlert) => void;
  closeAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used within AlertProvider");
  return ctx;
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<GlobalAlert | null>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("careconnect-alert");
      if (stored) return JSON.parse(stored) as GlobalAlert;
    }
    return null;
  });
  // visible is derived from alert state
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);

  // Show alert and start timer
  const showAlert = (a: GlobalAlert) => {
    setAlert(a);
    setProgress(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (a.duration) {
      const start = Date.now();
      const duration = a.duration;
      function tick() {
        const elapsed = Date.now() - start;
        const pct = Math.min(100, (elapsed / duration) * 100);
        setProgress(pct);
        if (pct < 100) {
          timerRef.current = setTimeout(tick, 50);
        } else {
          setAlert(null);
        }
      }
      tick();
    }
  };

  // Close alert manually
  const closeAlert = () => {
    setAlert(null);
    setProgress(0);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Persist alert in sessionStorage
  useEffect(() => {
    if (alert) {
      sessionStorage.setItem("careconnect-alert", JSON.stringify(alert));
    } else {
      sessionStorage.removeItem("careconnect-alert");
    }
  }, [alert]);

  // Restore alert on mount
  // No effect needed for alert visibility or progress

  return (
    <AlertContext.Provider value={{ showAlert, closeAlert }}>
      {children}
      {alert && (
        <div
          style={{
            position: "fixed",
            top: "2rem",
            right: "2rem",
            zIndex: 9999,
            maxWidth: "350px",
            transition: "transform 0.4s cubic-bezier(.4,0,.2,1)",
            transform: alert ? "translateX(0)" : "translateX(100%)",
          }}
        >
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={closeAlert}
          />
          <div
            style={{
              height: "4px",
              width: "100%",
              background: "var(--border-muted)",
              borderRadius: "2px",
              overflow: "hidden",
              marginTop: "-12px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "var(--primary)",
                transition: "width 0.1s linear",
              }}
            />
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}
