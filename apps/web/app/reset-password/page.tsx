"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setMessage("");

    if (otp.length !== 6) {
      setMessage("Please enter a 6-digit OTP");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5002/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Password reset failed"
        );
        return;
      }

      setMessage(
        "Password reset successful! Redirecting to login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to the authentication server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fb",
        padding: "30px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          background: "#ffffff",
          padding: "35px",
          borderRadius: "12px",
          boxShadow:
            "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            marginBottom: "8px",
          }}
        >
          Reset Password
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: "25px",
          }}
        >
          Enter the OTP sent to:
        </p>

        <p
          style={{
            fontWeight: "600",
            marginBottom: "25px",
          }}
        >
          {email}
        </p>

        <form onSubmit={handleResetPassword}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) =>
              setOtp(
                e.target.value.replace(/\D/g, "")
              )
            }
            required
            style={{
              width: "100%",
              padding: "13px",
              marginBottom: "14px",
              border: "1px solid #ddd",
              borderRadius: "7px",
              fontSize: "18px",
              textAlign: "center",
              letterSpacing: "4px",
              boxSizing: "border-box",
            }}
          />

          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "14px",
              border: "1px solid #ddd",
              borderRadius: "7px",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "14px",
              border: "1px solid #ddd",
              borderRadius: "7px",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              background: loading
                ? "#9ca3af"
                : "#111827",
              color: "#ffffff",
              border: "none",
              borderRadius: "7px",
              fontSize: "15px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "18px",
              textAlign: "center",
              color: "#333",
              fontSize: "14px",
            }}
          >
            {message}
          </p>
        )}

        <p
          style={{
            marginTop: "22px",
            textAlign: "center",
            color: "#666",
            fontSize: "14px",
          }}
        >
          Remember your password?{" "}
          <span
            onClick={() => router.push("/login")}
            style={{
              color: "#111827",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Login
          </span>
        </p>
      </div>
    </main>
  );
}