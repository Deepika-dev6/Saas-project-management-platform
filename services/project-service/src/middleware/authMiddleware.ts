import jwt from "jsonwebtoken";

export const authenticate = async (
  request: any,
  reply: any
) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({
        message: "Authentication required",
      });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return reply.status(401).send({
        message: "Invalid authorization format",
      });
    }

    const token = parts[1];

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return reply.status(500).send({
        message: "JWT secret is not configured",
      });
    }

    const decoded = jwt.verify(token, jwtSecret);

    request.user = decoded;

 } catch (error: any) {
  console.error("JWT verification error:", error.message);

  return reply.status(401).send({
    message: "Invalid or expired token",
  });
}
};