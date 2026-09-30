import {
  Activity,
  BellRing,
  BrainCircuit,
  Route,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  NavLink,
} from "react-router-dom";

const navigation = [
  {
    to: "/dashboard",
    label: "Climate Intelligence",
    icon: Activity,
  },
  {
    to: "/route-planner",
    label: "Resilient Routes",
    icon: Route,
  },
  {
    to: "/scenario",
    label: "Scenario Lab",
    icon: SlidersHorizontal,
  },
  {
    to: "/alerts",
    label: "Climate Alerts",
    icon: BellRing,
  },
];

export function Sidebar({
  open,
  onNavigate,
}) {
  return (
    <aside
      className={`sidebar ${
        open ? "sidebar-open" : ""
      }`}
    >
      <div className="sidebar-brand">
        <div className="brand-mark">
          <BrainCircuit size={22} />
        </div>

        <div>
          <strong>
            ClimateResilience AI
          </strong>

          <span>
            SANKALP · Climate Tech
          </span>
        </div>

        <button
          className="sidebar-close"
          onClick={onNavigate}
          aria-label="Close navigation"
        >
          <X size={19} />
        </button>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-label">
          PLATFORM
        </span>

        <nav>
          {navigation.map(
            ({
              to,
              label,
              icon: Icon,
            }) => (
              <NavLink
                key={to}
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `nav-link ${
                    isActive
                      ? "active"
                      : ""
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            )
          )}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="climate-badge">
          <span className="status-dot" />

          <div>
            <strong>
              Climate Engine
            </strong>

            <small>
              ML intelligence connected
            </small>
          </div>
        </div>

        <div className="sidebar-footnote">
          AI-powered decision support
          for climate-resilient
          mobility and infrastructure.
        </div>
      </div>
    </aside>
  );
}