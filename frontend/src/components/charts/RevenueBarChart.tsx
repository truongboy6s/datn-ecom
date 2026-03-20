import type { AdminRevenuePoint } from "@/types/admin";

interface RevenueBarChartProps {
  data: AdminRevenuePoint[];
}

export function RevenueBarChart({ data }: RevenueBarChartProps) {
  const maxValue = Math.max(...data.map((item) => item.revenue), 1);

  return (
    <section className="chart-card">
      <div className="chart-card__head">
        <h3>Doanh thu 6 thang</h3>
      </div>
      <div className="bar-chart">
        {data.map((item) => {
          const height = Math.round((item.revenue / maxValue) * 100);
          return (
            <div key={item.month} className="bar-chart__item">
              <div className="bar-chart__bar-wrap">
                <div className="bar-chart__bar" style={{ height: `${Math.max(height, 8)}%` }} />
              </div>
              <span>{item.month}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
