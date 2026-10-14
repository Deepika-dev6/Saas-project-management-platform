"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setMessage(
        "Password must be at least 6 characters long"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5002/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            phone: phone || null,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Registration failed"
        );
        return;
      }

      router.push(
        `/verify-otp?email=${encodeURIComponent(email)}`
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
          maxWidth: "450px",
          background: "#ffffff",
          padding: "35px",
          borderRadius: "12px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1
          style={{
            marginBottom: "8px",
            fontSize: "28px",
          }}
        >
          Create Account
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: "25px",
          }}
        >
          Create your project management account
        </p>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            required
            style={inputStyle}
          />

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

         <PhoneInput
  country={"in"}
  value={phone}
  onChange={(phone) => setPhone(phone)}
  inputStyle={{
    width: "100%",
    height: "46px",
    fontSize: "15px",
    border: "1px solid #ddd",
    borderRadius: "7px",
    boxSizing: "border-box",
  }}
  buttonStyle={{
    border: "1px solid #ddd",
    borderRadius: "7px 0 0 7px",
  }}
  containerStyle={{
    width: "100%",
    marginBottom: "14px",
  }}
  inputProps={{
    name: "phone",
    placeholder: "Phone number (optional)",
  }}
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

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            required
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p
          style={{
            marginTop: "22px",
            textAlign: "center",
            color: "#666",
            fontSize: "14px",
          }}
        >
          Already have an account?{" "}
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

        {message && (
          <p
            style={{
              marginTop: "18px",
              color: "#333",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {message}
          </p>
        )}
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