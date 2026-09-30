import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Activity,
  ArrowRight,
  CloudRain,
  Compass,
  MapPin,
  Mountain,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
  getClimateSummary,
} from "../services/api";

import ClimateMap from "../components/map/ClimateMap";

const DEFAULT_LOCATION = [
  26.1445,
  91.7362,
];

const DEMO_FALLBACK = {
  climateRiskScore: 48,
  climateRiskCategory:
    "Moderate",
  resilienceScore: 67,
  resilienceLabel:
    "Resilient",
  accessibilityScore: 52,
  hazardPriority:
    "MEDIUM",
  weather: {
    rainfall: 7.8,
    source: "demo",
  },
  terrain: {
    elevation: 210,
    slope: 8.4,
  },
  location: {
    latitude:
      DEFAULT_LOCATION[0],
    longitude:
      DEFAULT_LOCATION[1],
  },
};

function scoreClass(
  score
) {
  if (score >= 75)
    return "good";

  if (score >= 45)
    return "medium";

  return "danger";
}

function formatCoordinate(
  value
) {
  return Number(value).toFixed(4);
}

export function Dashboard() {
  const [
    selectedLocation,
    setSelectedLocation,
  ] = useState(
    DEFAULT_LOCATION
  );

  const [
    summary,
    setSummary,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    demoMode,
    setDemoMode,
  ] = useState(false);

  const loadSummary =
    useCallback(
      async (
        location =
          selectedLocation
      ) => {
        setLoading(true);

        try {
          const data =
            await getClimateSummary(
              location[0],
              location[1]
            );

          setSummary(data);
          setDemoMode(false);
        } catch (error) {
          console.error(error);

          setSummary(
            DEMO_FALLBACK
          );

          setDemoMode(true);

          toast.error(
            "Climate engine unavailable. Showing demo data."
          );
        } finally {
          setLoading(false);
        }
      },
      [selectedLocation]
    );

  useEffect(() => {
    loadSummary(
      selectedLocation
    );
  }, []);

  const handleMapSelect =
    async (location) => {
      setSelectedLocation(
        location
      );

      await loadSummary(
        location
      );
    };

  const data =
    summary ||
    DEMO_FALLBACK;

  const risk =
    Number(
      data.climateRiskScore ??
        0
    );

  const resilience =
    Number(
      data.resilienceScore ??
        0
    );

  const accessibility =
    Number(
      data.accessibilityScore ??
        0
    );

  return (
    <div className="page">
      <section className="hero-section">
        <div>
          <span className="eyebrow">
            SANKALP · CLIMATE EDITION
          </span>

          <h1>
            Climate Intelligence
            <br />
            for Resilient Regions
          </h1>

          <p>
            An AI-powered decision
            support platform that
            connects climate hazards,
            terrain and mobility risk
            to help identify safer,
            more resilient routes and
            infrastructure decisions.
          </p>
        </div>

        <div className="hero-actions">
          <Link
            to="/route-planner"
            className="button button-primary"
          >
            Plan resilient route
            <ArrowRight size={17} />
          </Link>

          <Link
            to="/scenario"
            className="button button-secondary"
          >
            Run climate scenario
          </Link>
        </div>
      </section>

      <section className="status-strip">
        <div>
          <span className="status-dot" />
          Climate intelligence engine
          active
        </div>

        <div>
          Analysis point:
          {" "}
          {formatCoordinate(
            selectedLocation[0]
          )}
          ,
          {" "}
          {formatCoordinate(
            selectedLocation[1]
          )}
        </div>

        {demoMode && (
          <div className="demo-indicator">
            Demo fallback
          </div>
        )}
      </section>

      <section className="kpi-grid">
        <MetricCard
          icon={
            <TriangleAlert
              size={20}
            />
          }
          label="Climate Risk"
          value={`${Math.round(
            risk
          )}`}
          suffix="/100"
          caption={
            data.climateRiskCategory ||
            "Unknown"
          }
          className={scoreClass(
            100 - risk
          )}
        />

        <MetricCard
          icon={
            <ShieldCheck
              size={20}
            />
          }
          label="Resilience"
          value={`${Math.round(
            resilience
          )}`}
          suffix="/100"
          caption={
            data.resilienceLabel ||
            "Unknown"
          }
          className={scoreClass(
            resilience
          )}
        />

        <MetricCard
          icon={
            <Compass size={20} />
          }
          label="Accessibility"
          value={`${Math.round(
            accessibility
          )}`}
          suffix="%"
          caption="Climate-aware access"
          className={scoreClass(
            accessibility
          )}
        />

        <MetricCard
          icon={
            <CloudRain
              size={20}
            />
          }
          label="Rainfall"
          value={
            data.weather
              ?.rainfall != null
              ? Number(
                  data.weather
                    .rainfall
                ).toFixed(1)
              : "—"
          }
          suffix=" mm"
          caption="Current model input"
          className="neutral"
        />
      </section>

      <section className="content-grid dashboard-grid">
        <div className="panel map-panel-large">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">
                LIVE ANALYSIS
              </span>

              <h2>
                Climate Risk Map
              </h2>

              <p>
                Click a location to
                run the existing ML
                hazard analysis.
              </p>
            </div>

            <button
              className="icon-button"
              onClick={() =>
                loadSummary()
              }
              disabled={loading}
              title="Refresh analysis"
            >
              <RefreshCw
                size={18}
                className={
                  loading
                    ? "spin"
                    : ""
                }
              />
            </button>
          </div>

          <ClimateMap
            center={
              selectedLocation
            }
            selectedLocation={
              selectedLocation
            }
            riskData={{
              climateRisk: {
                percentage:
                  risk,
                category:
                  data.climateRiskCategory,
              },
              resilience: {
                score:
                  resilience,
              },
            }}
            onSelectLocation={
              handleMapSelect
            }
            height={570}
          />
        </div>

        <div className="side-stack">
          <div className="panel">
            <div className="panel-header compact">
              <div>
                <span className="panel-kicker">
                  HAZARD PROFILE
                </span>

                <h2>
                  Location intelligence
                </h2>
              </div>
            </div>

            <div className="profile-list">
              <ProfileRow
                icon={
                  <Mountain
                    size={17}
                  />
                }
                label="Elevation"
                value={
                  data.terrain
                    ?.elevation !=
                  null
                    ? `${Number(
                        data
                          .terrain
                          .elevation
                      ).toFixed(
                        0
                      )} m`
                    : "—"
                }
              />

              <ProfileRow
                icon={
                  <Activity
                    size={17}
                  />
                }
                label="Slope"
                value={
                  data.terrain
                    ?.slope !=
                  null
                    ? `${Number(
                        data.terrain
                          .slope
                      ).toFixed(
                        1
                      )}°`
                    : "—"
                }
              />

              <ProfileRow
                icon={
                  <CloudRain
                    size={17}
                  />
                }
                label="Rainfall"
                value={
                  data.weather
                    ?.rainfall !=
                  null
                    ? `${Number(
                        data
                          .weather
                          .rainfall
                      ).toFixed(
                        1
                      )} mm`
                    : "—"
                }
              />

              <ProfileRow
                icon={
                  <MapPin
                    size={17}
                  />
                }
                label="Hazard priority"
                value={
                  data.hazardPriority ||
                  "UNKNOWN"
                }
                danger={
                  data.hazardPriority ===
                  "HIGH"
                }
              />
            </div>
          </div>

          <div className="panel insight-panel">
            <span className="panel-kicker">
              AI DECISION SUPPORT
            </span>

            <h2>
              What does the score mean?
            </h2>

            <p>
              The platform combines
              the existing ML hazard
              prediction with terrain,
              rainfall and road
              proximity to produce
              decision-support scores.
            </p>

            <div className="insight-line">
              <span>
                ML hazard
              </span>

              <strong>
                {data.climateRiskCategory ||
                  "—"}
              </strong>
            </div>

            <div className="insight-line">
              <span>
                Resilience
              </span>

              <strong>
                {Math.round(
                  resilience
                )}
                /100
              </strong>
            </div>

            <Link
              to="/scenario"
              className="text-link"
            >
              Test a climate scenario
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  suffix,
  caption,
  className,
}) {
  return (
    <div
      className={`metric-card ${className}`}
    >
      <div className="metric-icon">
        {icon}
      </div>

      <span className="metric-label">
        {label}
      </span>

      <div className="metric-value">
        {value}
        <small>
          {suffix}
        </small>
      </div>

      <span className="metric-caption">
        {caption}
      </span>
    </div>
  );
}

function ProfileRow({
  icon,
  label,
  value,
  danger,
}) {
  return (
    <div className="profile-row">
      <div className="profile-row-label">
        {icon}
        <span>
          {label}
        </span>
      </div>

      <strong
        className={
          danger
            ? "danger-text"
            : ""
        }
      >
        {value}
      </strong>
    </div>
  );
}