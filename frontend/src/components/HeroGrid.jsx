import { Link } from "react-router-dom";

export default function HeroGrid({ featured }) {
  const main = featured[0];
  const side = featured.slice(1, 3);

  return (
    <div className="heroGrid">
      {/* Principal */}
      {main && (
        <Link to={`/blog/${main.slug}`} className="heroMain card">
          <img src={main.coverImage} alt={main.title} />
          <div className="heroOverlay">
            <div className="pill">{main.category}</div>
            <div className="heroTitle">{main.title}</div>
            <div className="muted">Por {main.author.name} • {main.date}</div>
          </div>
        </Link>
      )}

      {/* Secundarios */}
      <div className="heroSide">
        {side.map((p) => (
          <Link key={p.slug} to={`/blog/${p.slug}`} className="heroMini card">
            <img src={p.coverImage} alt={p.title} />
            <div className="heroMiniBody">
              <div className="pill">{p.category}</div>
              <div className="heroMiniTitle">{p.title}</div>
              <div className="muted">{p.date}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
