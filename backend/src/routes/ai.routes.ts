import { Router } from "express";
import { AiController } from "../controllers/ai.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { chatSchema } from "../schemas/ai.schema";

const router = Router();

// Regular users can chat
router.post("/chat", authenticate, validate(chatSchema), AiController.chat);

// Only Admin can run business analysis
router.post("/analyze", authenticate, authorize(["ADMIN"]), AiController.analyzeBusiness);

export default router;
