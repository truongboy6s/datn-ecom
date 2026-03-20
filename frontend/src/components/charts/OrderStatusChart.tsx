import type { StatusShareItem } from "@/types/admin";

interface OrderStatusChartProps {
  data: StatusShareItem[];
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0) || 1;
  const gradient = buildConicGradient(data);

  return (
    <section className="chart-card">
      <div className="chart-card__head">
        <h3>Ti le trang thai don</h3>
      </div>
      <div className="donut-chart-wrap">
        <div className="donut-chart" style={{ background: gradient }}>
          <div className="donut-chart__inner">{total}%</div>
        </div>
        <ul className="donut-legend">
          {data.map((item) => (
            <li key={item.label}>
              <span style={{ background: item.color }} />
              {item.label}: {item.value}%
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function buildConicGradient(data: StatusShareItem[]) {
  let start = 0;
  const slices = data.map((item) => {
    const end = start + item.value;
    const slice = `${item.color} ${start}% ${end}%`;
    start = end;
    return slice;
  });
  return `conic-gradient(${slices.join(", ")})`;
}
