import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const { JWT_SECRET } = process.env;
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not configured");

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 1000, // 7 days in milliseconds
    sameSite: "strict", // CSRF protection
    httpOnly: true, // prevents XSS attack: cross-site scripting
    secure: process.env.NODE_ENV === "production",
  });

  return token;
};
