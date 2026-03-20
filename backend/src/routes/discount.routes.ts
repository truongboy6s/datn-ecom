import { Router } from "express";
import { DiscountController } from "../controllers/discount.controller";

const router = Router();

router.get("/", DiscountController.listActive);

export default router;
