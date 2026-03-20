import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authenticate, authorize } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createProductSchema, updateProductSchema } from "../schemas/product.schema";
import { updateOrderSchema } from "../schemas/order.schema";
import { updateUserRoleSchema } from "../schemas/admin.schema";
import { createCategorySchema, updateCategorySchema } from "../schemas/category.schema";
import { createDiscountSchema, updateDiscountSchema } from "../schemas/discount.schema";

const router = Router();

router.use(authenticate, authorize(["ADMIN"]));

router.get("/metrics", AdminController.getMetrics);
router.get("/orders", AdminController.listOrders);
router.patch("/orders/:id", validate(updateOrderSchema), AdminController.updateOrder);

router.get("/products", AdminController.listProducts);
router.post("/products", validate(createProductSchema), AdminController.createProduct);
router.patch("/products/:id", validate(updateProductSchema), AdminController.updateProduct);
router.delete("/products/:id", AdminController.deleteProduct);

router.get("/categories", AdminController.listCategories);
router.post("/categories", validate(createCategorySchema), AdminController.createCategory);
router.patch("/categories/:id", validate(updateCategorySchema), AdminController.updateCategory);
router.delete("/categories/:id", AdminController.deleteCategory);

router.get("/discounts", AdminController.listDiscounts);
router.post("/discounts", validate(createDiscountSchema), AdminController.createDiscount);
router.patch("/discounts/:id", validate(updateDiscountSchema), AdminController.updateDiscount);
router.delete("/discounts/:id", AdminController.deleteDiscount);

router.get("/users", AdminController.listUsers);
router.patch("/users/:id/role", validate(updateUserRoleSchema), AdminController.updateUserRole);
router.delete("/users/:id", AdminController.deleteUser);

export default router;
