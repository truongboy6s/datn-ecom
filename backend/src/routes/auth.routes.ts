import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { registerSchema, loginSchema, updateProfileSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from "../schemas/auth.schema";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.get("/verify-email", AuthController.verifyEmail);
router.post("/login", validate(loginSchema), AuthController.login);
router.patch("/me", authenticate, validate(updateProfileSchema), AuthController.updateProfile);
router.post("/forgot-password", validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), AuthController.resetPassword);
router.patch("/change-password", authenticate, validate(changePasswordSchema), AuthController.changePassword);

export default router;
