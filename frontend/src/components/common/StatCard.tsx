import Link from "next/link";

interface StatCardProps {
  label: string;
  value: string;
  icon?: string;
  trend?: string;
  trendDirection?: "up" | "down";
  iconBg?: string;
  iconColor?: string;
}

export function StatCard({ label, value, icon, trend, trendDirection, iconBg, iconColor }: StatCardProps) {
  return (
    <article className="stat-card">
      {icon ? (
        <div
          className="stat-card__icon"
          style={{ background: iconBg || "var(--brand-soft)", color: iconColor || "var(--brand)" }}
        >
          {icon}
        </div>
      ) : null}
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      {trend ? (
        <span className={`stat-card__trend ${trendDirection || "up"}`}>
          {trendDirection === "down" ? "↓" : "↑"} {trend}
        </span>
      ) : null}
    </article>
  );
}
