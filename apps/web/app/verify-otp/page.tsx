"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // 5 minutes = 300 seconds
  const [timeLeft, setTimeLeft] = useState(300);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleVerify = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setMessage("");

    if (timeLeft <= 0) {
      setMessage(
        "OTP has expired. Please request a new OTP."
      );
      return;
    }

    if (otp.length !== 6) {
      setMessage("Please enter a 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5002/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "OTP verification failed"
        );
        return;
      }

      setMessage(
        "Email verified successfully! Redirecting to login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to the authentication server"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setMessage("");

    try {
      setResending(true);

      const response = await fetch(
        "http://localhost:5002/auth/resend-otp",
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
          data.message || "Failed to resend OTP"
        );
        return;
      }

      setOtp("");

      // Restart 5-minute countdown
      setTimeLeft(300);

      setMessage(
        "A new OTP has been sent to your email."
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to the authentication server"
      );
    } finally {
      setResending(false);
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
          Verify Your Email
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: "10px",
          }}
        >
          Enter the 6-digit OTP sent to:
        </p>

        <p
          style={{
            fontWeight: "600",
            marginBottom: "25px",
          }}
        >
          {email}
        </p>

        {/* Countdown */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "18px",
            fontSize: "14px",
            color:
              timeLeft > 60 ? "#555" : "#dc2626",
          }}
        >
          {timeLeft > 0 ? (
            <>
              OTP expires in{" "}
              <strong>
                {minutes}:
                {seconds.toString().padStart(2, "0")}
              </strong>
            </>
          ) : (
            <strong>OTP has expired</strong>
          )}
        </div>

        <form onSubmit={handleVerify}>
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
              marginBottom: "15px",
              border: "1px solid #ddd",
              borderRadius: "7px",
              fontSize: "18px",
              textAlign: "center",
              letterSpacing: "4px",
              boxSizing: "border-box",
            }}
          />

          <button
            type="submit"
            disabled={
              loading || timeLeft <= 0
            }
            style={{
              width: "100%",
              padding: "13px",
              background:
                loading || timeLeft <= 0
                  ? "#9ca3af"
                  : "#111827",
              color: "#ffffff",
              border: "none",
              borderRadius: "7px",
              fontSize: "15px",
              cursor:
                loading || timeLeft <= 0
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading
              ? "Verifying..."
              : "Verify OTP"}
          </button>
        </form>

        {/* Resend OTP */}
        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          <p
            style={{
              color: "#666",
              fontSize: "14px",
              marginBottom: "8px",
            }}
          >
            Didn't receive the OTP?
          </p>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={
              resending || timeLeft > 0
            }
            style={{
              background: "none",
              border: "none",
              color:
                resending || timeLeft > 0
                  ? "#9ca3af"
                  : "#111827",
              fontWeight: "600",
              fontSize: "14px",
              cursor:
                resending || timeLeft > 0
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {resending
              ? "Sending..."
              : timeLeft > 0
              ? "Resend OTP after expiry"
              : "Resend OTP"}
          </button>
        </div>

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
      </div>
    </main>
  );
}