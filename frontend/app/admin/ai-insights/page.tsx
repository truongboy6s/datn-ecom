"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import type { Product } from "@/types/domain";

type InsightRecord = {
  id: string;
  type: string;
  result: { insights?: string[] };
  createdAt: string;
};

const INSIGHT_STYLES = [
  { icon: "📈", color: "#22c55e", bgColor: "#dcfce7" },
  { icon: "⚡", color: "#f97316", bgColor: "#fff7ed" },
  { icon: "🧭", color: "#3b82f6", bgColor: "#dbeafe" },
  { icon: "💡", color: "#8b5cf6", bgColor: "#ede9fe" },
];

export default function AdminAIInsightsPage() {
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [insightRecord, setInsightRecord] = useState<InsightRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      apiClient("/products?page=1&limit=100"),
      apiClient("/ai/analyze", { method: "POST" }),
    ])
      .then(([productsRes, insightRes]) => {
        if (!active) return;
        const products = (productsRes?.data?.docs || []) as Product[];
        const sorted = [...products].sort((a, b) => (b.stock > a.stock ? -1 : 1)).slice(0, 5);
        setTopProducts(sorted);
        setInsightRecord(insightRes?.data || null);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Khong the tai du lieu AI.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const insights = insightRecord?.result?.insights || [];

  return (
    <>
      <h1>🤖 AI Phân tích kinh doanh</h1>
      <p className="page-subtitle">AI phân tích dữ liệu bán hàng và đưa ra gợi ý chiến lược.</p>
      {error ? <p style={{ color: "#ef4444" }}>{error}</p> : null}

      {/* Insight Cards */}
      <div className="insight-grid">
        {loading ? (
          <div className="insight-card">
            <p style={{ color: "var(--muted)" }}>Dang tai phan tich AI...</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="insight-card">
            <p style={{ color: "var(--muted)" }}>Chua co du lieu phan tich.</p>
          </div>
        ) : (
          insights.map((text, idx) => {
            const style = INSIGHT_STYLES[idx % INSIGHT_STYLES.length];
            return (
              <div key={`${insightRecord?.id || "insight"}-${idx}`} className="insight-card">
                <div
                  className="insight-card__icon"
                  style={{ background: style.bgColor, color: style.color }}
                >
                  {style.icon}
                </div>
                <h3>Goi y #{idx + 1}</h3>
                <p>{text}</p>
                <div className="insight-card__value" style={{ color: style.color }}>
                  {insightRecord?.type || "AI Insight"}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AI Recommendations */}
      <div className="insight-recommendation">
        <h3>💡 Gợi ý từ AI</h3>
        <ul style={{ paddingLeft: 20, lineHeight: 2, color: "var(--muted)" }}>
          {insights.length === 0 ? (
            <li>Chua co goi y tu AI.</li>
          ) : (
            insights.map((text, idx) => (
              <li key={`rec-${idx}`}>{text}</li>
            ))
          )}
        </ul>
      </div>

      {/* Top Products Table */}
      <div style={{ marginTop: 24 }}>
        <h2>📊 Top sản phẩm bán chạy</h2>
        <table className="table-block">
          <thead>
            <tr>
              <th>#</th>
              <th>Ảnh</th>
              <th>Sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Tồn kho</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, i) => (
              <tr key={product.id}>
                <td>
                  <span style={{
                    background: i === 0 ? "#fef3c7" : "var(--bg)",
                    width: 28, height: 28, borderRadius: "50%",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: ".85rem"
                  }}>
                    {i + 1}
                  </span>
                </td>
                <td>
                  <img className="table-product-thumb" src={product.imageUrl || ""} alt={product.name} />
                </td>
                <td><strong>{product.name}</strong></td>
                <td>{product.category?.name || "-"}</td>
                <td>{product.price.toLocaleString("vi-VN")}₫</td>
                <td>{product.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && topProducts.length === 0 ? (
          <p className="page-subtitle" style={{ marginTop: 12 }}>
            Chua co san pham de hien thi.
          </p>
        ) : null}
      </div>
    </>
  );
}
