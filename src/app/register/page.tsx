"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { register as registerAction } from "@/lib/actions/auth";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "student",
    },
  });

  const password = watch("password");

  // Password strength indicators
  const hasMinLength = password?.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password || "");
  const hasLowerCase = /[a-z]/.test(password || "");
  const hasNumber = /[0-9]/.test(password || "");

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await registerAction(data);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">CareConnect</h1>
          <p className="text-blue-100 text-lg">
            Caraga State University PSG Referral System
          </p>
        </div>
        <div className="text-blue-100 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Secure & Confidential</h3>
              <p className="text-sm text-blue-200">
                Your information is protected with RA 10173 compliance
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Easy Appointments</h3>
              <p className="text-sm text-blue-200">
                Book sessions with PSG members in real-time
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Track Your Progress</h3>
              <p className="text-sm text-blue-200">
                Monitor your mental health journey with personalized support
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">
              Join CareConnect to access mental health support
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                {...register("fullName")}
                placeholder="Juan Dela Cruz"
                className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                placeholder="your.name@carsu.edu.ph"
                className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* School ID */}
            <div>
              <label
                htmlFor="schoolId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                School ID
              </label>
              <input
                id="schoolId"
                type="text"
                {...register("schoolId")}
                placeholder="2024-1234"
                className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
              />
              {errors.schoolId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.schoolId.message}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative flex items-center justify-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                  <input
                    type="radio"
                    value="student"
                    {...register("role")}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <span className="text-sm font-medium text-gray-800">
                    Student
                  </span>
                </label>
                <label className="relative flex items-center justify-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                  <input
                    type="radio"
                    value="psg_member"
                    {...register("role")}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <span className="text-sm font-medium text-gray-800">
                    PSG Member
                  </span>
                </label>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Create a strong password"
                  className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {/* Password Requirements */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        hasMinLength ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span
                      className={
                        hasMinLength ? "text-green-700" : "text-gray-500"
                      }
                    >
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        hasUpperCase ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span
                      className={
                        hasUpperCase ? "text-green-700" : "text-gray-500"
                      }
                    >
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        hasLowerCase ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span
                      className={
                        hasLowerCase ? "text-green-700" : "text-gray-500"
                      }
                    >
                      One lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        hasNumber ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span
                      className={hasNumber ? "text-green-700" : "text-gray-500"}
                    >
                      One number
                    </span>
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-2 border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
