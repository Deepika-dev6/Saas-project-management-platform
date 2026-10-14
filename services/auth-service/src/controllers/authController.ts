import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import pool from "../config/database";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// ===============================
// REGISTER USER
// ===============================
export const registerUser = async (
  request: any,
  reply: any
) => {
  try {
    const {
      name,
      email,
      phone,
      password,
    } = request.body;

    if (!name || !email || !password) {
      return reply.status(400).send({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return reply.status(400).send({
        message: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return reply.status(409).send({
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      10
    );

    const userResult = await pool.query(
      `INSERT INTO users
       (name, email, phone, password_hash, role, is_verified, verification_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, phone, role, is_verified`,
      [
        name,
        email,
        phone || null,
        passwordHash,
        "Member",
        false,
        "email",
      ]
    );

    const user = userResult.rows[0];

    // Generate OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpHash = await bcrypt.hash(
      otp,
      10
    );

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // Store registration OTP
    await pool.query(
      `INSERT INTO otp_verifications
       (user_id, email, otp_hash, expires_at, purpose)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        user.id,
        email,
        otpHash,
        expiresAt,
        "registration",
      ]
    );

    await transporter.sendMail({
      from: `"project Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for SaaS Project Management",
      text: `Hello ${name},

Your OTP is: ${otp}

This OTP is valid for 5 minutes.

If you did not create this account, please ignore this email.`,
    });

    console.log("Generated OTP:", otp);

    return reply.status(201).send({
      message:
        "Registration successful. OTP verification required.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.is_verified,
      },
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return reply.status(500).send({
      message: "Failed to register user",
    });
  }
};

// ===============================
// VERIFY REGISTRATION OTP
// ===============================
export const verifyOtp = async (
  request: any,
  reply: any
) => {
  try {
    const { email, otp } = request.body;

    if (!email || !otp) {
      return reply.status(400).send({
        message: "Email and OTP are required",
      });
    }

    const userResult = await pool.query(
      `SELECT id, name, email, phone, role, is_verified
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return reply.status(404).send({
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    if (user.is_verified) {
      return reply.status(400).send({
        message: "User is already verified",
      });
    }

    // Only registration OTP
    const otpResult = await pool.query(
      `SELECT id, otp_hash, expires_at
       FROM otp_verifications
       WHERE user_id = $1
         AND purpose = 'registration'
         AND verified = false
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );

    if (otpResult.rows.length === 0) {
      return reply.status(400).send({
        message: "No active registration OTP found",
      });
    }

    const otpRecord = otpResult.rows[0];

    if (
      new Date() >
      new Date(otpRecord.expires_at)
    ) {
      return reply.status(400).send({
        message: "OTP has expired",
      });
    }

    const isOtpValid = await bcrypt.compare(
      otp,
      otpRecord.otp_hash
    );

    if (!isOtpValid) {
      return reply.status(400).send({
        message: "Invalid OTP",
      });
    }

    await pool.query(
      `UPDATE users
       SET is_verified = true,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [user.id]
    );

    await pool.query(
      `UPDATE otp_verifications
       SET verified = true
       WHERE id = $1`,
      [otpRecord.id]
    );

    return reply.status(200).send({
      message: "Email verified successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error(
      "OTP verification error:",
      error
    );

    return reply.status(500).send({
      message: "Failed to verify OTP",
    });
  }
};

// ===============================
// LOGIN
// ===============================
export const loginUser = async (
  request: any,
  reply: any
) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.status(400).send({
        message: "Email and password are required",
      });
    }

    const userResult = await pool.query(
      `SELECT id, name, email, phone, password_hash, role, is_verified
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return reply.status(401).send({
        message: "Invalid email or password",
      });
    }

    const user = userResult.rows[0];

    if (!user.is_verified) {
      return reply.status(403).send({
        message:
          "Please verify your email before logging in",
      });
    }

    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!isPasswordValid) {
      return reply.status(401).send({
        message: "Invalid email or password",
      });
    }

    const jwtSecret =
      process.env.JWT_SECRET;

    if (!jwtSecret) {
      return reply.status(500).send({
        message:
          "JWT secret is not configured",
      });
    }

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: "15m",
      }
    );

    return reply.status(200).send({
      message: "Login successful",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.is_verified,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return reply.status(500).send({
      message: "Failed to login",
    });
  }
};

// ===============================
// RESEND REGISTRATION OTP
// ===============================
export const resendOtp = async (
  request: any,
  reply: any
) => {
  try {
    const { email } = request.body;

    if (!email) {
      return reply.status(400).send({
        message: "Email is required",
      });
    }

    const userResult = await pool.query(
      `SELECT id, name, email, is_verified
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return reply.status(404).send({
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    if (user.is_verified) {
      return reply.status(400).send({
        message: "Email is already verified",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpHash = await bcrypt.hash(
      otp,
      10
    );

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // Invalidate previous registration OTPs
    await pool.query(
      `UPDATE otp_verifications
       SET verified = true
       WHERE user_id = $1
         AND purpose = 'registration'
         AND verified = false`,
      [user.id]
    );

    // Store new registration OTP
    await pool.query(
      `INSERT INTO otp_verifications
       (user_id, email, otp_hash, expires_at, purpose)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        user.id,
        email,
        otpHash,
        expiresAt,
        "registration",
      ]
    );

    await transporter.sendMail({
      from: `"project Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject:
        "Your New OTP for SaaS Project Management",
      text: `Hello ${user.name},

Your new OTP is: ${otp}

This OTP is valid for 5 minutes.

If you did not request this OTP, please ignore this email.`,
    });

    console.log(
      "New OTP generated:",
      otp
    );

    return reply.status(200).send({
      message:
        "A new OTP has been sent to your email. Check spam!",
    });
  } catch (error) {
    console.error(
      "Resend OTP error:",
      error
    );

    return reply.status(500).send({
      message: "Failed to resend OTP",
    });
  }
};

// ===============================
// FORGOT PASSWORD
// ===============================
export const forgotPassword = async (
  request: any,
  reply: any
) => {
  try {
    const { email } = request.body;

    if (!email) {
      return reply.status(400).send({
        message: "Email is required",
      });
    }

    const userResult = await pool.query(
      `SELECT id, name, email, is_verified
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return reply.status(404).send({
        message:
          "No account found with this email",
      });
    }

    const user = userResult.rows[0];

    if (!user.is_verified) {
      return reply.status(403).send({
        message:
          "Please verify your email first",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpHash = await bcrypt.hash(
      otp,
      10
    );

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // Invalidate previous password reset OTPs
    await pool.query(
      `UPDATE otp_verifications
       SET verified = true
       WHERE user_id = $1
         AND purpose = 'password_reset'
         AND verified = false`,
      [user.id]
    );

    // Store password reset OTP
    await pool.query(
      `INSERT INTO otp_verifications
       (user_id, email, otp_hash, expires_at, purpose)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        user.id,
        email,
        otpHash,
        expiresAt,
        "password_reset",
      ]
    );

    await transporter.sendMail({
      from: `"project Hub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      text: `Hello ${user.name},

Your password reset OTP is: ${otp}

This OTP is valid for 5 minutes.

If you did not request a password reset, please ignore this email.`,
    });

    console.log(
      "Password reset OTP:",
      otp
    );

    return reply.status(200).send({
      message:
        "Password reset OTP has been sent to your email. Check spam!",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return reply.status(500).send({
      message:
        "Failed to send password reset OTP",
    });
  }
};

// ===============================
// RESET PASSWORD
// ===============================
export const resetPassword = async (
  request: any,
  reply: any
) => {
  try {
    const {
      email,
      otp,
      password,
    } = request.body;

    if (!email || !otp || !password) {
      return reply.status(400).send({
        message:
          "Email, OTP and new password are required",
      });
    }

    if (otp.length !== 6) {
      return reply.status(400).send({
        message: "OTP must be 6 digits",
      });
    }

    if (password.length < 6) {
      return reply.status(400).send({
        message:
          "Password must be at least 6 characters",
      });
    }

    const userResult = await pool.query(
      `SELECT id, email, is_verified
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return reply.status(404).send({
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    if (!user.is_verified) {
      return reply.status(403).send({
        message:
          "Please verify your email first",
      });
    }

    // Only password reset OTP
    const otpResult = await pool.query(
      `SELECT id, otp_hash, expires_at
       FROM otp_verifications
       WHERE user_id = $1
         AND purpose = 'password_reset'
         AND verified = false
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );

    if (otpResult.rows.length === 0) {
      return reply.status(400).send({
        message:
          "No valid password reset OTP found",
      });
    }

    const otpRecord = otpResult.rows[0];

    if (
      new Date() >
      new Date(otpRecord.expires_at)
    ) {
      return reply.status(400).send({
        message:
          "OTP has expired. Please request a new one.",
      });
    }

    const isOtpValid =
      await bcrypt.compare(
        otp,
        otpRecord.otp_hash
      );

    if (!isOtpValid) {
      return reply.status(400).send({
        message: "Invalid OTP",
      });
    }

    const passwordHash =
      await bcrypt.hash(password, 10);

    await pool.query(
      `UPDATE users
       SET password_hash = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [
        passwordHash,
        user.id,
      ]
    );

    // Mark reset OTP as used
    await pool.query(
      `UPDATE otp_verifications
       SET verified = true
       WHERE id = $1`,
      [otpRecord.id]
    );

    return reply.status(200).send({
      message:
        "Password reset successfully",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return reply.status(500).send({
      message:
        "Failed to reset password",
    });
  }
};