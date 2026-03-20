import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../utils/response";
import { prisma } from "../config/db";
import { ProductRepository } from "../repositories/product.repository";
import { OrderRepository } from "../repositories/order.repository";
import { UserRepository } from "../repositories/user.repository";
import { CategoryRepository } from "../repositories/category.repository";
import { DiscountRepository } from "../repositories/discount.repository";

export class AdminController {
  static async getMetrics(_req: Request, res: Response, next: NextFunction) {
    try {
      const [orderAgg, totalUsers] = await Promise.all([
        prisma.order.aggregate({
          _sum: { totalPrice: true },
          _count: { id: true },
        }),
        prisma.user.count(),
      ]);

      const topItem = await prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 1,
      });

      let topProduct: string | undefined;
      if (topItem.length > 0) {
        const product = await prisma.product.findUnique({
          where: { id: topItem[0].productId },
          select: { name: true },
        });
        topProduct = product?.name;
      }

      return sendSuccess(res, {
        revenue: orderAgg._sum.totalPrice || 0,
        totalOrders: orderAgg._count.id || 0,
        totalUsers,
        topProduct,
      }, "Admin metrics fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async listOrders(_req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await OrderRepository.findAll();
      return sendSuccess(res, orders, "Orders fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateOrder(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { status, paymentStatus } = req.body as { status?: string; paymentStatus?: string };
      const updated = await OrderRepository.updateById(req.params.id, { status, paymentStatus });
      return sendSuccess(res, updated, "Order updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async listProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const skip = (page - 1) * limit;
      const { products, total } = await ProductRepository.findAll(skip, limit);

      return sendSuccess(res, {
        docs: products,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      }, "Products fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, price, stock, imageUrl, categoryId } = req.body as {
        name: string;
        description: string;
        price: number;
        stock: number;
        imageUrl?: string;
        categoryId: string;
      };

      const product = await ProductRepository.create({
        name,
        description,
        price,
        stock,
        imageUrl,
        category: { connect: { id: categoryId } },
      });

      return sendSuccess(res, product, "Product created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { name, description, price, stock, imageUrl, categoryId } = req.body as {
        name?: string;
        description?: string;
        price?: number;
        stock?: number;
        imageUrl?: string | null;
        categoryId?: string;
      };

      const data: any = { name, description, price, stock, imageUrl };
      if (categoryId) {
        data.category = { connect: { id: categoryId } };
      }

      const product = await ProductRepository.updateById(req.params.id, data);
      return sendSuccess(res, product, "Product updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const product = await ProductRepository.deleteById(req.params.id);
      return sendSuccess(res, product, "Product deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  static async listUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return sendSuccess(res, users, "Users fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRole(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { role } = req.body as { role: "USER" | "ADMIN" };
      const updated = await UserRepository.updateById(req.params.id, { role });
      return sendSuccess(res, updated, "User role updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const deleted = await prisma.user.delete({
        where: { id: req.params.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
      return sendSuccess(res, deleted, "User deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  static async listCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryRepository.findAllWithCounts();
      return sendSuccess(res, categories, "Categories fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, slug, description } = req.body as {
        name: string;
        slug: string;
        description?: string | null;
      };

      const category = await CategoryRepository.create({
        name,
        slug,
        description: description ?? null,
      });

      return sendSuccess(res, category, "Category created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { name, slug, description } = req.body as {
        name?: string;
        slug?: string;
        description?: string | null;
      };

      const category = await CategoryRepository.updateById(req.params.id, {
        name,
        slug,
        description: description ?? undefined,
      });

      return sendSuccess(res, category, "Category updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const deleted = await CategoryRepository.deleteById(req.params.id);
      return sendSuccess(res, deleted, "Category deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  static async listDiscounts(_req: Request, res: Response, next: NextFunction) {
    try {
      const discounts = await DiscountRepository.findAll();
      return sendSuccess(res, discounts, "Discounts fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async createDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, description, discount, discountType, maxUses, expiresAt, isActive } = req.body as {
        code: string;
        description?: string | null;
        discount: number;
        discountType: "percentage" | "fixed";
        maxUses?: number | null;
        expiresAt?: string | null;
        isActive?: boolean;
      };

      const discountRecord = await DiscountRepository.create({
        code,
        description: description ?? null,
        discount,
        discountType,
        maxUses: maxUses ?? null,
        isActive: isActive ?? true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      return sendSuccess(res, discountRecord, "Discount created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateDiscount(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { description, discount, discountType, maxUses, expiresAt, isActive } = req.body as {
        description?: string | null;
        discount?: number;
        discountType?: "percentage" | "fixed";
        maxUses?: number | null;
        expiresAt?: string | null;
        isActive?: boolean;
      };

      const data: {
        description?: string | null;
        discount?: number;
        discountType?: "percentage" | "fixed";
        maxUses?: number | null;
        isActive?: boolean;
        expiresAt?: Date | null;
      } = {};

      if (typeof description !== "undefined") data.description = description;
      if (typeof discount !== "undefined") data.discount = discount;
      if (typeof discountType !== "undefined") data.discountType = discountType;
      if (typeof maxUses !== "undefined") data.maxUses = maxUses;
      if (typeof isActive !== "undefined") data.isActive = isActive;
      if (typeof expiresAt !== "undefined") {
        data.expiresAt = expiresAt ? new Date(expiresAt) : null;
      }

      const updated = await DiscountRepository.updateById(req.params.id, data);
      return sendSuccess(res, updated, "Discount updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteDiscount(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const deleted = await DiscountRepository.deleteById(req.params.id);
      return sendSuccess(res, deleted, "Discount deleted successfully");
    } catch (error) {
      next(error);
    }
  }
}
