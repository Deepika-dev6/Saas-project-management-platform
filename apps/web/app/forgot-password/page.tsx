"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setMessage("");

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5002/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Failed to send OTP"
        );
        return;
      }

      router.push(
        `/reset-password?email=${encodeURIComponent(email)}`
      );
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
          Forgot Password
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: "25px",
          }}
        >
          Enter your registered email address and
          we'll send you a password reset OTP.
        </p>

        <form onSubmit={handleForgotPassword}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
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
              ? "Sending OTP..."
              : "Send Reset OTP"}
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