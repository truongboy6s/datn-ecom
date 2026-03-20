import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { validate } from "../middlewares/validate";
import { getProductsSchema } from "../schemas/product.schema";

const router = Router();

router.get("/", validate(getProductsSchema), ProductController.getProducts);
router.get("/:id", ProductController.getProductById);

export default router;
