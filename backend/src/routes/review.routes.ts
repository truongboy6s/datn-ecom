import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authenticate } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { createReviewSchema, listReviewsSchema, reviewEligibilitySchema } from "../schemas/review.schema";

const router = Router();

router.get("/", validate(listReviewsSchema), ReviewController.listByProduct);
router.get("/eligibility", authenticate, validate(reviewEligibilitySchema), ReviewController.getEligibility);
router.post("/", authenticate, validate(createReviewSchema), ReviewController.createReview);

export default router;
