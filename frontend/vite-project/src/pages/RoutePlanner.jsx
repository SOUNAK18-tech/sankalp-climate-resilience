import {
  useState,
} from "react";

import {
  ArrowRight,
  Clock3,
  MapPin,
  Navigation,
  Route,
  Search,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import toast from "react-hot-toast";

import ClimateMap from "../components/map/ClimateMap";

import {
  geocodePlace,
  getDrivingRoute,
  getRouteRisk,
  sampleRoutePoints,
} from "../services/api";

const DEFAULT_START = [
  26.1445,
  91.7362,
];

const DEFAULT_END = [
  25.5788,
  91.8933,
];

export function RoutePlanner() {
  const [
    startQuery,
    setStartQuery,
  ] = useState(
    "Guwahati"
  );

  const [
    endQuery,
    setEndQuery,
  ] = useState(
    "Shillong"
  );

  const [
    start,
    setStart,
  ] = useState(
    DEFAULT_START
  );

  const [
    end,
    setEnd,
  ] = useState(
    DEFAULT_END
  );

  const [
    startResults,
    setStartResults,
  ] = useState([]);

  const [
    endResults,
    setEndResults,
  ] = useState([]);

  const [
    route,
    setRoute,
  ] = useState([]);

  const [
    routeInfo,
    setRouteInfo,
  ] = useState(null);

  const [
    routeRisk,
    setRouteRisk,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function searchLocation(
    query,
    setter
  ) {
    if (!query.trim()) {
      setter([]);
      return;
    }

    try {
      const data =
        await geocodePlace(
          query
        );

      setter(
        data.results || []
      );
    } catch (error) {
      toast.error(
        error.message
      );
    }
  }

  function selectLocation(
    item,
    type
  ) {
    const coords = [
      Number(item.latitude),
      Number(item.longitude),
    ];

    if (type === "start") {
      setStart(coords);
      setStartQuery(
        item.name
      );
      setStartResults([]);
    } else {
      setEnd(coords);
      setEndQuery(
        item.name
      );
      setEndResults([]);
    }
  }

  async function calculateRoute() {
    setLoading(true);
    setRouteRisk(null);

    try {
      const result =
        await getDrivingRoute(
          start,
          end
        );

      setRoute(
        result.coordinates
      );

      setRouteInfo(result);

      const points =
        sampleRoutePoints(
          result.coordinates,
          30
        );

      if (!points.length) {
        throw new Error(
          "The route contains no analyzable points."
        );
      }

      const risk =
        await getRouteRisk(
          points
        );

      setRouteRisk(risk);

      toast.success(
        "Climate-resilient route analysis completed."
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error.message ||
          "Unable to analyze the route."
      );
    } finally {
      setLoading(false);
    }
  }

  const resilience =
    routeRisk
      ?.climateResilience
      ?.score;

  const category =
    routeRisk
      ?.routeRisk
      ?.category;

  const recommendation =
    routeRisk
      ?.recommendation;

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">
            SUSTAINABLE MOBILITY
          </span>

          <h1>
            Climate-Resilient
            <br />
            Route Planner
          </h1>

          <p>
            Compare route exposure
            using the existing AI
            hazard engine before
            choosing a route.
          </p>
        </div>
      </section>

      <section className="route-layout">
        <div className="panel route-controls">
          <div className="panel-header compact">
            <div>
              <span className="panel-kicker">
                ROUTE INPUT
              </span>

              <h2>
                Plan your journey
              </h2>
            </div>
          </div>

          <LocationInput
            label="Starting point"
            value={startQuery}
            onChange={
              setStartQuery
            }
            onSearch={() =>
              searchLocation(
                startQuery,
                setStartResults
              )
            }
            results={startResults}
            onSelect={(item) =>
              selectLocation(
                item,
                "start"
              )
            }
          />

          <div className="route-connector">
            <div />
          </div>

          <LocationInput
            label="Destination"
            value={endQuery}
            onChange={
              setEndQuery
            }
            onSearch={() =>
              searchLocation(
                endQuery,
                setEndResults
              )
            }
            results={endResults}
            onSelect={(item) =>
              selectLocation(
                item,
                "end"
              )
            }
          />

          <button
            className="button button-primary full-width route-submit"
            onClick={
              calculateRoute
            }
            disabled={loading}
          >
            <Navigation
              size={17}
            />

            {loading
              ? "Analyzing route..."
              : "Analyze resilient route"}
          </button>

          {routeInfo && (
            <div className="route-summary">
              <div>
                <span>
                  Distance
                </span>

                <strong>
                  {routeInfo.distanceKm.toFixed(
                    1
                  )}{" "}
                  km
                </strong>
              </div>

              <div>
                <span>
                  Estimated time
                </span>

                <strong>
                  {Math.round(
                    routeInfo.durationMinutes
                  )}{" "}
                  min
                </strong>
              </div>
            </div>
          )}
        </div>

        <div className="panel route-map-panel">
          <ClimateMap
            center={start}
            selectedLocation={start}
            route={route}
            routeRisk={routeRisk}
            height={650}
          />
        </div>
      </section>

      {routeRisk && (
        <section className="route-results">
          <div className="result-heading">
            <div>
              <span className="panel-kicker">
                AI ROUTE ANALYSIS
              </span>

              <h2>
                Climate exposure
                assessment
              </h2>
            </div>
          </div>

          <div className="result-grid">
            <ResultCard
              icon={
                <ShieldCheck
                  size={20}
                />
              }
              label="Route resilience"
              value={
                resilience != null
                  ? `${Math.round(
                      resilience
                    )}/100`
                  : "—"
              }
              caption={
                routeRisk
                  .climateResilience
                  ?.label ||
                "Unknown"
              }
            />

            <ResultCard
              icon={
                <TriangleAlert
                  size={20}
                />
              }
              label="Overall risk"
              value={
                category ||
                "Unknown"
              }
              caption={`${routeRisk.routeRisk?.averageRisk ?? 0}% average risk`}
              danger={
                category ===
                  "High" ||
                category ===
                  "Very High"
              }
            />

            <ResultCard
              icon={
                <Route size={20} />
              }
              label="High-risk points"
              value={
                routeRisk
                  .routeRisk
                  ?.highRiskPoints ??
                0
              }
              caption={`${routeRisk.routeRisk?.analyzedPoints ?? 0} points analyzed`}
              danger={
                (
                  routeRisk
                    .routeRisk
                    ?.highRiskPoints ??
                  0
                ) > 0
              }
            />

            <ResultCard
              icon={
                <Clock3
                  size={20}
                />
              }
              label="Recommendation"
              value={
                recommendation
                  ?.action
                    ?.replaceAll(
                      "_",
                      " "
                    ) ||
                "ROUTE ACCEPTABLE"
              }
              caption={
                recommendation
                  ?.message ||
                ""
              }
            />
          </div>

          <div className="recommendation-panel">
            <div className="recommendation-icon">
              <ShieldCheck
                size={22}
              />
            </div>

            <div>
              <span>
                CLIMATE-AWARE
                RECOMMENDATION
              </span>

              <strong>
                {recommendation
                  ?.message ||
                  "The selected route has been analyzed using climate-risk indicators."}
              </strong>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function LocationInput({
  label,
  value,
  onChange,
  onSearch,
  results,
  onSelect,
}) {
  return (
    <div className="location-input">
      <label>
        {label}
      </label>

      <div className="search-row">
        <MapPin
          size={17}
        />

        <input
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          onKeyDown={(event) => {
            if (
              event.key ===
              "Enter"
            ) {
              onSearch();
            }
          }}
          placeholder="Search a location"
        />

        <button
          className="search-button"
          onClick={onSearch}
          aria-label={`Search ${label}`}
        >
          <Search size={17} />
        </button>
      </div>

      {results.length > 0 && (
        <div className="search-results">
          {results
            .slice(0, 5)
            .map((item) => (
              <button
                key={`${item.latitude}-${item.longitude}`}
                onClick={() =>
                  onSelect(item)
                }
              >
                <MapPin
                  size={15}
                />

                <span>
                  {item.name}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

function ResultCard({
  icon,
  label,
  value,
  caption,
  danger,
}) {
  return (
    <div
      className={`result-card ${
        danger
          ? "result-danger"
          : ""
      }`}
    >
      <div className="result-icon">
        {icon}
      </div>

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        {caption}
      </small>
    </div>
  );
}