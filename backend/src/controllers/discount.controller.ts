import { Request, Response, NextFunction } from "express";
import { DiscountRepository } from "../repositories/discount.repository";
import { sendSuccess } from "../utils/response";

export class DiscountController {
  static async listActive(_req: Request, res: Response, next: NextFunction) {
    try {
      const discounts = await DiscountRepository.findAll();
      const now = new Date();
      const active = discounts.filter((discount) => {
        if (!discount.isActive) return false;
        if (discount.expiresAt && discount.expiresAt <= now) return false;
        if (discount.maxUses !== null && discount.usesCount >= discount.maxUses) return false;
        return true;
      });

      return sendSuccess(res, active, "Discounts fetched successfully");
    } catch (error) {
      next(error);
    }
  }
}
