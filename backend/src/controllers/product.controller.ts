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

  /**
   * Search products with fuzzy matching, filters, sorting, pagination.
   * GET /api/products/search?q=laptop&page=1&limit=20&sortBy=price&sortOrder=asc&categoryId=xxx&minPrice=100&maxPrice=5000
   */
  static async searchProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q as string) || "";
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const sortBy = (req.query.sortBy as string) || "relevance";
      const sortOrder = (req.query.sortOrder as string) || "desc";
      const categoryId = req.query.categoryId as string | undefined;
      const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
      const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;

      if (!q.trim()) {
        return sendError(res, "Search query is required", null, 400);
      }

      const result = await ProductService.searchProducts(q, page, limit, {
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
        categoryId,
        minPrice,
        maxPrice,
      });

      // If no results found, include suggestions
      if (result.docs.length === 0) {
        const suggestions = await ProductService.getSuggestions();
        return sendSuccess(res, { ...result, suggestions }, "No products found. Showing suggestions.");
      }

      return sendSuccess(res, result, "Search results fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lightweight autocomplete for search dropdown.
   * GET /api/products/autocomplete?q=lap
   */
  static async autocomplete(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q as string) || "";

      if (!q.trim()) {
        return sendSuccess(res, [], "Empty query");
      }

      const results = await ProductService.autocomplete(q);
      return sendSuccess(res, results, "Autocomplete results");
    } catch (error) {
      next(error);
    }
  }
}
