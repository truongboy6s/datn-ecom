import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { registerSchema, loginSchema, updateProfileSchema } from "../schemas/auth.schema";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.get("/verify-email", AuthController.verifyEmail);
router.post("/login", validate(loginSchema), AuthController.login);
router.patch("/me", authenticate, validate(updateProfileSchema), AuthController.updateProfile);

export default router;
