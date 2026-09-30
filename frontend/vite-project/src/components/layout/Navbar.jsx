import {
  CloudRain,
  Menu,
  ShieldCheck,
} from "lucide-react";

export function Navbar({
  onMenuClick,
}) {
  return (
    <header className="topbar">
      <button
        className="menu-button"
        onClick={onMenuClick}
        aria-label="Toggle navigation"
      >
        <Menu size={21} />
      </button>

      <div className="topbar-title">
        <div className="topbar-icon">
          <CloudRain size={18} />
        </div>

        <div>
          <strong>
            Climate Resilience Intelligence
          </strong>

          <span>
            Climate-aware mobility &
            infrastructure decision support
          </span>
        </div>
      </div>

      <div className="topbar-status">
        <ShieldCheck size={16} />
        <span>
          AI Engine Active
        </span>
      </div>
    </header>
  );
}