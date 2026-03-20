import express from "express";
import cors from "cors";

// Middlewares
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "./utils/logger";

// Routers
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import paymentRoutes from "./routes/payment.routes";
import aiRoutes from "./routes/ai.routes";
import adminRoutes from "./routes/admin.routes";
import discountRoutes from "./routes/discount.routes";
import reviewRoutes from "./routes/review.routes";

import cookieParser from "cookie-parser";

const app = express();

// Global Middlewares
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Request logger middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Setup api routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/reviews", reviewRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Backend is running smoothly" });
});

// Global Error Handler must be last!
app.use(errorHandler);

export default app;
