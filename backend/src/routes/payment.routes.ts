import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.post("/momo/callback", PaymentController.momoWebhook);
router.get("/momo/return", PaymentController.momoReturn);
router.post("/momo/create", authenticate, PaymentController.momoCreate);
router.get("/vnpay/callback", PaymentController.vnpayWebhook);
router.get("/vnpay/return", PaymentController.vnpayReturn);
router.post("/vnpay/create", authenticate, PaymentController.vnpayCreate);

export default router;
