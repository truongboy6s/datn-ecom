interface AuthShowcaseProps {
  title: string;
  points: string[];
}

export function AuthShowcase({ title, points }: AuthShowcaseProps) {
  return (
    <aside className="auth-showcase">
      <p className="hero-tag">Thanh vien moi</p>
      <h2>{title}</h2>
      <ul>
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </aside>
  );
}
