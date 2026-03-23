import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.post("/momo/callback", PaymentController.momoWebhook);
router.post("/momo/create", authenticate, PaymentController.momoCreate);
router.get("/vnpay/callback", PaymentController.vnpayWebhook);

export default router;
