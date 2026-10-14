import {
  registerUser,
  verifyOtp,
  loginUser,
  resendOtp,
  forgotPassword,
  resetPassword,
} from "../controllers/authController";

import { authenticateToken } from "../middleware/authMiddleware";

export default async function authRoutes(app: any) {
  app.post("/register", registerUser);

  app.post("/verify-otp", verifyOtp);

  app.post("/resend-otp", resendOtp);

  app.post("/forgot-password", forgotPassword);

  app.post("/reset-password", resetPassword);

  app.post("/login", loginUser);

  app.get(
    "/me",
    {
      preHandler: authenticateToken,
    },
    async (request: any, reply: any) => {
      return reply.status(200).send({
        message: "Protected route accessed successfully",
        user: request.user,
      });
    }
  );
}