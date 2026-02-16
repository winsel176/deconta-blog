import { Link } from "react-router-dom";

export default function TopBar() {
  return (
    <div className="nav">
      <div className="container nav-inner">
        <Link className="brand" to="/">Deconta</Link>

        <div className="nav-links">
          <Link className="btn" to="/blog">Blog</Link>
          <Link className="btn btn-primary" to="/ai">IA</Link>
        </div>
      </div>
    </div>
  );
}
