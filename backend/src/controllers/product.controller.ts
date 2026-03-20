import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";
import { sendSuccess, sendError } from "../utils/response";

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await ProductService.getProducts(page, limit);
      return sendSuccess(res, result, "Products fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.getProductById(req.params.id as string);
      return sendSuccess(res, result, "Product fetched successfully");
    } catch (error: any) {
      if (error.message === "Product not found") {
        return sendError(res, error.message, null, 404);
      }
      next(error);
    }
  }
}
