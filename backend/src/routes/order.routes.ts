import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { idempotency } from "../middlewares/idempotency";
import { createOrderSchema } from "../schemas/order.schema";

const router = Router();

router.post(
  "/",
  authenticate,
  idempotency,
  validate(createOrderSchema),
  OrderController.createOrder
);

router.get("/", authenticate, OrderController.getUserOrders);
router.post("/:id/pay", authenticate, OrderController.retryMoMoPayment);
router.post("/:id/cancel", authenticate, OrderController.cancelOrder);

export default router;
