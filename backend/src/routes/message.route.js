import express from "express";

const router = express.Router();

router.get("send", (req, res, next) => {
  console.log("msg send endpoint");
});

export default router;
