import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";

const router = Router();

router.post("/momo/callback", PaymentController.momoWebhook);
router.get("/vnpay/callback", PaymentController.vnpayWebhook);

export default router;
