"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { login } from "@/lib/actions/auth";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useAlert } from "@/components/AlertProvider";
import { useSearchParams } from "next/navigation";
import { ThemeToggler } from "@/components/ThemeToggler";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const { showAlert } = useAlert();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);

    // Set loginSuccess flag BEFORE calling server action
    // because redirect will interrupt execution
    console.log("Setting loginSuccess flag before server action");
    if (typeof window !== "undefined") {
      sessionStorage.setItem("loginSuccess", "true");
      console.log(
        "loginSuccess flag set:",
        sessionStorage.getItem("loginSuccess")
      );
    }

    const result = await login(data);
    if (result?.error) {
      // Clear the flag if there's an error
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("loginSuccess");
      }
      showAlert({
        type: "error",
        message: result.error,
        duration: 4000,
      });
      setIsLoading(false);
    }
    // If no error, redirect will happen automatically from server action
  };

  // Show success alert if registered=true in search params
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      showAlert({
        type: "success",
        message: "Account created successfully! Please sign in to continue.",
        duration: 4000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div
      className="flex min-h-screen relative"
      style={{ background: "var(--bg)", transition: "background 0.3s" }}
    >
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggler />
      </div>

      {/* Left side - Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between"
        style={{
          background: "var(--bg-dark)",
          transition: "background 0.3s, border-radius 0.3s",
        }}
      >
        <div>
          <h1
            className="text-3xl font-bold mb-4"
            style={{ color: "var(--primary)" }}
          >
            CareConnect
          </h1>
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>
            Caraga State University PSG Referral System
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src="/authlogo.png"
            alt="CareConnect Logo"
            width={600}
            height={600}
            style={{ objectFit: "contain" }}
          />
        </div>
        <div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Streamlining mental health support for students through secure
            referrals and appointments.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          className="w-full max-w-md p-8"
          style={{
            background: "var(--bg-light)",
            borderRadius: "1rem",
            boxShadow: "0 2px 16px 0 var(--border-muted)",
            transition: "box-shadow 0.3s, background 0.3s, border-radius 0.3s",
          }}
        >
          <div className="text-center mb-8">
            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: "var(--text)" }}
            >
              Welcome Back!
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              Sign in to your CareConnect account
            </p>
          </div>

          {/* Alerts are now global and shown in top right corner */}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text)" }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="your.name@carsu.edu.ph"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
                style={{
                  background: "var(--bg)",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                }}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm" style={{ color: "var(--danger)" }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition pr-12 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
                  style={{
                    background: "var(--bg)",
                    color: "var(--text)",
                    borderColor: "var(--border)",
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--highlight)" }}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm" style={{ color: "var(--danger)" }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.2),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.08)]"
              style={{ background: "var(--primary)", color: "var(--bg-dark)" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium"
                style={{ color: "var(--secondary)" }}
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
