import { prisma } from "../config/db";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const aiCache = new Map<string, { data: string; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache for AI replies

export class AiService {
  static async recommendProducts(message: string) {
    // 1. Check Cache
    const cacheKey = `chat_${message.trim().toLowerCase()}`;
    const cached = aiCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      logger.info(`AI Cache hit for message: ${message}`);
      return cached.data;
    }

    // 2. Filter DB first (e.g. limit to top 10 products with stock)
    const availableProducts = await prisma.product.findMany({
      where: { stock: { gt: 0 } },
      take: 10,
      select: { id: true, name: true, price: true, category: { select: { name: true } } },
    });

    const productContext = JSON.stringify(availableProducts);

    // 3. Prompt Engineering
    const prompt = `You are a helpful e-commerce assistant. Based on this product list: ${productContext}. Answer the user's query: "${message}". Suggest up to 3 suitable products and explain why. If there are no relevant products, apologize.`;

    // 4. Call LLM (Mocked for now since API key handling isn't strictly requested to execute)
    // Normally: const response = await fetch('https://api.openai... / gemini...', { method: 'POST', body: JSON.stringify({ prompt }) });
    let llmResponse = "We recommend these products based on our latest inventory: ...";
    if (env.OPENAI_API_KEY || env.GEMINI_API_KEY) {
      logger.info("Calling LLM API...");
      // Simulate real LLM delay
      // llmResponse = await llmClient.generate(prompt);
      llmResponse = `Based on your request, I recommend: ${availableProducts.slice(0, 3).map(p => p.name).join(", ")}.`;
    }

    // 5. Cache response
    aiCache.set(cacheKey, { data: llmResponse, expiry: Date.now() + CACHE_TTL });

    return llmResponse;
  }

  static async runBusinessAnalysis() {
    // 1. Fetch raw data from DB
    const orders = await prisma.order.findMany({
      where: { paymentStatus: "PAID" },
      include: { items: { include: { product: true } } },
    });

    // 2. Aggregate Data
    let totalRevenue = 0;
    const productSales: Record<string, number> = {};

    orders.forEach(order => {
      totalRevenue += order.totalPrice;
      order.items.forEach(item => {
        productSales[item.product.name] = (productSales[item.product.name] || 0) + item.quantity;
      });
    });

    const aggregatedData = {
      totalRevenue,
      totalOrders: orders.length,
      topSellingProducts: Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, qty]) => ({ name, qty })),
    };

    // 3. Send to AI
    const prompt = `Analyze the following aggregated sales data and provide 3 business recommendations: ${JSON.stringify(aggregatedData)}`;
    
    // Simulate LLM response
    const insightReport = {
      insights: [
        `Revenue is stable at ${totalRevenue}.`,
        "Top selling products need restock.",
        "Consider running a promotion on low-performing items."
      ]
    };

    // 4. Save to DB
    const aiInsight = await prisma.aIInsight.create({
      data: {
        type: "Weekly Sales Analysis",
        result: insightReport,
      },
    });

    logger.info("Successfully ran Business Analysis Pipeline");
    return aiInsight;
  }
}
