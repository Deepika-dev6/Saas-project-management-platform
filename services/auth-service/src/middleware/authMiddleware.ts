import jwt from "jsonwebtoken";

export const authenticateToken = async (
  request: any,
  reply: any
) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return reply.status(401).send({
        message: "Authorization token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return reply.status(401).send({
        message: "Invalid authorization format",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return reply.status(500).send({
        message: "JWT secret is not configured",
      });
    }

    const decoded = jwt.verify(token, jwtSecret);

    request.user = decoded;
  } catch (error) {
    return reply.status(401).send({
      message: "Invalid or expired token",
    });
  }
};