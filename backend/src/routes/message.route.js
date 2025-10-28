import express from "express";

const router = express.Router();

router.get("/send", (req, res, next) => {
  console.log("msg send endpoint");
  res.status(200).json({ message: "Message send endpoint - not yet implemented" });
});

export default router;
