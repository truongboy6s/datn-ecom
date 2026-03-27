import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { validate } from "../middlewares/validate";
import { getProductsSchema, searchProductsSchema, autocompleteSchema } from "../schemas/product.schema";

const router = Router();

// Search & Autocomplete (must be before /:id)
router.get("/search", validate(searchProductsSchema), ProductController.searchProducts);
router.get("/autocomplete", validate(autocompleteSchema), ProductController.autocomplete);

// CRUD
router.get("/", validate(getProductsSchema), ProductController.getProducts);
router.get("/:id", ProductController.getProductById);

export default router;
