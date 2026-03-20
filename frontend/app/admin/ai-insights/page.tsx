"use client";

import { mockAIInsights, mockProducts } from "@/data/store-mock";

export default function AdminAIInsightsPage() {
  const topProducts = [...mockProducts].sort((a, b) => (b.stock > a.stock ? -1 : 1)).slice(0, 5);

  return (
    <>
      <h1>🤖 AI Phân tích kinh doanh</h1>
      <p className="page-subtitle">AI phân tích dữ liệu bán hàng và đưa ra gợi ý chiến lược.</p>

      {/* Insight Cards */}
      <div className="insight-grid">
        {mockAIInsights.map((insight) => (
          <div key={insight.id} className="insight-card">
            <div
              className="insight-card__icon"
              style={{ background: insight.bgColor, color: insight.color }}
            >
              {insight.icon}
            </div>
            <h3>{insight.title}</h3>
            <p>{insight.description}</p>
            <div className="insight-card__value" style={{ color: insight.color }}>
              {insight.value}
            </div>
          </div>
        ))}
      </div>

      {/* AI Recommendations */}
      <div className="insight-recommendation">
        <h3>💡 Gợi ý từ AI</h3>
        <ul style={{ paddingLeft: 20, lineHeight: 2, color: "var(--muted)" }}>
          <li><strong>Tăng tồn kho Gaming Beast X</strong> — Sản phẩm hot nhưng chỉ còn 8 SP, risk hết hàng trong 5 ngày</li>
          <li><strong>Mở rộng danh mục Gaming Gear</strong> — Lượt truy cập tăng 45%, nên thêm chuột, tai nghe gaming</li>
          <li><strong>Chạy Flash Deal cho Earbuds AirTune</strong> — Conversion rate cao nhất khi giảm 30-35%</li>
          <li><strong>Combo marketing</strong> — Combo Laptop + Phụ kiện tăng AOV 28%, nên push notification</li>
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
                <td>{product.category?.name}</td>
                <td>{product.price.toLocaleString("vi-VN")}₫</td>
                <td>{product.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
