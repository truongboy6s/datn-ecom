import { Request, Response, NextFunction } from "express";
import { AiService } from "../services/ai.service";
import { sendSuccess, sendError } from "../utils/response";
import { AuthRequest } from "../middlewares/auth";
import { prisma } from "../config/db";

export class AiController {
  static async chat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { message } = req.body;
      const userId = req.user!.userId;

      // 1. Get AI recommendation
      const reply = await AiService.recommendProducts(message);

      // 2. Save chat history to DB
      await prisma.chatMessage.createMany({
        data: [
          { userId, role: "USER", message },
          { userId, role: "ASSISTANT", message: reply },
        ],
      });

      return sendSuccess(res, { reply }, "AI responded successfully");
    } catch (error) {
      next(error);
    }
  }

  static async analyzeBusiness(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const insight = await AiService.runBusinessAnalysis();
      return sendSuccess(res, insight, "Business analysis completed successfully");
    } catch (error) {
      next(error);
    }
  }
}
