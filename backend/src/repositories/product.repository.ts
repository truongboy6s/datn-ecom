import { prisma } from "../config/db";
import { Prisma } from "@prisma/client";

export interface SearchFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price" | "newest" | "best-selling" | "relevance";
  sortOrder?: "asc" | "desc";
}

export class ProductRepository {
  static async findAll(skip: number, take: number) {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take,
        include: { category: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count(),
    ]);

    return { products, total };
  }

  static async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  static async create(data: any) {
    return prisma.product.create({
      data,
      include: { category: true },
    });
  }

  static async updateById(id: string, data: any) {
    return prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  static async deleteById(id: string) {
    return prisma.product.delete({
      where: { id },
      include: { category: true },
    });
  }

  /**
   * Fuzzy search using pg_trgm's % operator + GIN index.
   * Falls back to ILIKE for short queries (< 3 chars).
   * Returns products sorted by similarity DESC, then newest.
   */
  static async search(
    query: string,
    skip: number,
    take: number,
    filters: SearchFilters = {}
  ) {
    const normalizedQuery = query.trim().toLowerCase();
    const { categoryId, minPrice, maxPrice, sortBy, sortOrder } = filters;

    // Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Fuzzy match: combine ILIKE (substring) + pg_trgm % (typo tolerance)
    if (normalizedQuery.length >= 3) {
      // ILIKE catches "laptop" in "Laptop Gaming MSI Katana 15"
      // % operator catches typos like "laptpo" → "laptop"
      conditions.push(`(LOWER(p.name) ILIKE $${paramIndex} OR LOWER(p.name) % $${paramIndex + 1})`);
      params.push(`%${normalizedQuery}%`);
      params.push(normalizedQuery);
      paramIndex += 2;
    } else {
      conditions.push(`LOWER(p.name) ILIKE $${paramIndex}`);
      params.push(`%${normalizedQuery}%`);
      paramIndex++;
    }

    if (categoryId) {
      conditions.push(`p."categoryId" = $${paramIndex}`);
      params.push(categoryId);
      paramIndex++;
    }
    if (minPrice !== undefined) {
      conditions.push(`p.price >= $${paramIndex}`);
      params.push(minPrice);
      paramIndex++;
    }
    if (maxPrice !== undefined) {
      conditions.push(`p.price <= $${paramIndex}`);
      params.push(maxPrice);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Build ORDER BY
    let orderClause: string;
    switch (sortBy) {
      case "price":
        orderClause = `ORDER BY p.price ${sortOrder === "desc" ? "DESC" : "ASC"}`;
        break;
      case "newest":
        orderClause = `ORDER BY p."createdAt" DESC`;
        break;
      case "best-selling":
        orderClause = `ORDER BY order_count DESC, p."createdAt" DESC`;
        break;
      default: // relevance
        if (normalizedQuery.length >= 3) {
          // Add similarity param for ORDER BY
          orderClause = `ORDER BY similarity(LOWER(p.name), $${paramIndex}) DESC, p."createdAt" DESC`;
          params.push(normalizedQuery);
          paramIndex++;
        } else {
          orderClause = `ORDER BY p."createdAt" DESC`;
        }
        break;
    }

    // Count query
    const countQuery = `
      SELECT COUNT(*)::int as total
      FROM "Product" p
      ${whereClause}
    `;

    // Main query with category join + order count for best-selling
    const dataQuery = `
      SELECT
        p.id, p.name, p.description, p.price, p.stock,
        p."imageUrl", p."categoryId", p."createdAt",
        json_build_object('id', c.id, 'name', c.name, 'slug', c.slug, 'description', c.description) as category,
        COALESCE(oc.order_count, 0)::int as order_count
      FROM "Product" p
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      LEFT JOIN (
        SELECT "productId", COUNT(*)::int as order_count
        FROM "OrderItem"
        GROUP BY "productId"
      ) oc ON p.id = oc."productId"
      ${whereClause}
      ${orderClause}
      LIMIT ${take} OFFSET ${skip}
    `;

    const [countResult, products] = await Promise.all([
      prisma.$queryRawUnsafe<[{ total: number }]>(countQuery, ...params),
      prisma.$queryRawUnsafe<any[]>(dataQuery, ...params),
    ]);

    return {
      products: products.map((p) => ({
        ...p,
        category: typeof p.category === "string" ? JSON.parse(p.category) : p.category,
      })),
      total: countResult[0]?.total ?? 0,
    };
  }

  /**
   * Lightweight autocomplete: only returns minimal fields.
   * No joins on large tables, no description/reviews.
   */
  static async autocomplete(query: string, limit: number = 8) {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length < 1) return [];

    if (normalizedQuery.length >= 3) {
      // Combine ILIKE (substring) + pg_trgm % (fuzzy/typo tolerance)
      return prisma.$queryRaw<
        { id: string; name: string; imageUrl: string | null; price: number }[]
      >`
        SELECT id, name, "imageUrl", price
        FROM "Product"
        WHERE LOWER(name) ILIKE ${'%' + normalizedQuery + '%'} OR LOWER(name) % ${normalizedQuery}
        ORDER BY similarity(LOWER(name), ${normalizedQuery}) DESC
        LIMIT ${limit}
      `;
    } else {
      // ILIKE for very short queries
      return prisma.$queryRaw<
        { id: string; name: string; imageUrl: string | null; price: number }[]
      >`
        SELECT id, name, "imageUrl", price
        FROM "Product"
        WHERE LOWER(name) ILIKE ${`%${normalizedQuery}%`}
        ORDER BY "createdAt" DESC
        LIMIT ${limit}
      `;
    }
  }

  /**
   * Get suggestion products: best-selling + newest.
   * Used when search returns no results.
   */
  static async getSuggestions(limit: number = 8) {
    return prisma.$queryRaw<
      { id: string; name: string; imageUrl: string | null; price: number }[]
    >`
      SELECT p.id, p.name, p."imageUrl", p.price
      FROM "Product" p
      LEFT JOIN (
        SELECT "productId", COUNT(*)::int as order_count
        FROM "OrderItem"
        GROUP BY "productId"
      ) oc ON p.id = oc."productId"
      ORDER BY COALESCE(oc.order_count, 0) DESC, p."createdAt" DESC
      LIMIT ${limit}
    `;
  }
}
