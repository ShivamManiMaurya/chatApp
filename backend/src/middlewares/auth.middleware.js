import jwt from "jsonwebtoken";

export const protectedRoute = (req, res, next) => {
  try {
    const token =
      req.cookies?.jwt || req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }

    // verify token
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object
    req.user = decode;
    req.userId = decode.id || decode.userId;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Token verification failed",
    });
  }
};
