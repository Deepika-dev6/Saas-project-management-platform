"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5002/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      // Save access token
      localStorage.setItem(
        "accessToken",
        data.accessToken
      );

      // Save user information
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setMessage("Login successful!");

      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
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
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            marginBottom: "8px",
          }}
        >
          Login
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: "25px",
          }}
        >
          Sign in to your project management account
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
            style={inputStyle}
          />

          <input
            type="password"
            
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
            style={inputStyle}
          />

          <p
  style={{
    textAlign: "right",
    marginTop: "-5px",
    marginBottom: "18px",
    fontSize: "14px",
  }}
>
  <span
    onClick={() => router.push("/forgot-password")}
    style={{
      color: "#111827",
      fontWeight: "600",
      cursor: "pointer",
    }}
  >
    Forgot Password?
  </span>
</p>

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? "Logging in..." : "Login"}
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
          Don't have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            style={{
              color: "#111827",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Create Account
          </span>
        </p>
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "14px",
  border: "1px solid #ddd",
  borderRadius: "7px",
  fontSize: "15px",
  boxSizing: "border-box" as const,
};

const buttonStyle = {
  width: "100%",
  padding: "13px",
  background: "#111827",
  color: "#ffffff",
  border: "none",
  borderRadius: "7px",
  fontSize: "15px",
  cursor: "pointer",
};