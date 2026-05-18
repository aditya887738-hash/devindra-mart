import { Link } from "react-router-dom";

export default function Shell({ title, subtitle, icon, nav = [], children }) {
  return (
    <div>
      <header className="top">
        <div className="brand">
          <div className="logo">DM</div>
          <div><h2>{title}</h2><p>{subtitle}</p></div>
        </div>
        <div className="topIcon">{icon}</div>
      </header>
      <main className="wrap">{children}</main>
      {nav.length > 0 && (
        <nav className="bottom">
          {nav.map((n) => <span key={n}>{n}</span>)}
        </nav>
      )}
    </div>
  );
}
