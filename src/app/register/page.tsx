"use client";

import RegistrationForm from "./components/RegistrationForm";
import { ThemeToggler } from "@/components/ThemeToggler";

export default function RegisterPage() {
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
            style={{
              objectFit: "contain",
              filter: "var(--auth-image-filter)",
              transition: "filter 0.3s",
            }}
          />
        </div>
        <div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Your mental health journey starts here. Join our supportive
            community.
          </p>
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <RegistrationForm />
      </div>
    </div>
  );
}
