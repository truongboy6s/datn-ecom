import { ProductRepository } from "../repositories/product.repository";
import { prisma } from "../config/db";
import { logger } from "../utils/logger";

// Simple In-Memory Cache (For DEV)
// NOTE for PROD: Replace `cache` with a Redis client (e.g. `redis.get/set`)
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 60 * 1000; // 60 seconds

export class ProductService {
  static async getProducts(page: number, limit: number) {
    const cacheKey = `products_page_${page}_limit_${limit}`;

    // 1. Check Cache
    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      logger.info(`Cache hit for ${cacheKey}`);
      return cached.data;
    }

    // 2. Fetch from DB if not cached
    const skip = (page - 1) * limit;
    const { products, total } = await ProductRepository.findAll(skip, limit);
    const productIds = products.map((product) => product.id);
    const reviewStats = productIds.length
      ? await prisma.review.groupBy({
          by: ["productId"],
          where: { productId: { in: productIds } },
          _count: { _all: true },
          _avg: { rating: true },
        })
      : [];

    const reviewMap = new Map(
      reviewStats.map((stat) => [stat.productId, stat])
    );

    const productsWithReviews = products.map((product) => {
      const stat = reviewMap.get(product.id);
      return {
        ...product,
        reviewCount: stat?._count?._all ?? 0,
        averageRating: stat?._avg?.rating ?? 0,
      };
    });

    const result = {
      docs: productsWithReviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    // 3. Save to Cache
    logger.info(`Cache miss for ${cacheKey}. Fetching from DB and caching.`);
    cache.set(cacheKey, { data: result, expiry: Date.now() + CACHE_TTL });

    return result;
  }

  static async getProductById(id: string) {
    const cacheKey = `product_${id}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    const product = await ProductRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    const stats = await prisma.review.aggregate({
      where: { productId: id },
      _count: { _all: true },
      _avg: { rating: true },
    });

    const productWithReviews = {
      ...product,
      reviewCount: stats._count?._all ?? 0,
      averageRating: stats._avg?.rating ?? 0,
    };

    cache.set(cacheKey, { data: productWithReviews, expiry: Date.now() + CACHE_TTL });
    return productWithReviews;
  }
}
