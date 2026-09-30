import {
  useState,
} from "react";

import {
  CloudRain,
  MapPin,
  Play,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import toast from "react-hot-toast";

import ClimateMap from "../components/map/ClimateMap";

import {
  getClimateSummary,
  simulateClimateScenario,
} from "../services/api";

const DEFAULT_LOCATION = [
  26.1445,
  91.7362,
];

const scenarios = [
  {
    id: "normal",
    label: "Normal",
    description:
      "Current baseline conditions",
  },
  {
    id: "heavy_rainfall",
    label: "Heavy rainfall",
    description:
      "Increased rainfall exposure",
  },
  {
    id: "extreme_rainfall",
    label: "Extreme rainfall",
    description:
      "Severe rainfall event",
  },
  {
    id: "flood",
    label: "Flood event",
    description:
      "Major disruption scenario",
  },
  {
    id: "landslide_event",
    label: "Landslide event",
    description:
      "Elevated slope instability",
  },
];

export function ScenarioSimulator() {
  const [
    selectedScenario,
    setSelectedScenario,
  ] = useState(
    "heavy_rainfall"
  );

  const [
    selectedLocation,
    setSelectedLocation,
  ] = useState(
    DEFAULT_LOCATION
  );

  const [
    baseline,
    setBaseline,
  ] = useState(null);

  const [
    simulation,
    setSimulation,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function runSimulation(
    location =
      selectedLocation
  ) {
    setLoading(true);

    try {
      const [
        baseData,
        scenarioData,
      ] = await Promise.all([
        getClimateSummary(
          location[0],
          location[1]
        ),

        simulateClimateScenario({
          lat: location[0],
          lon: location[1],
          scenario:
            selectedScenario,
          intensity: 1,
        }),
      ]);

      setBaseline(
        baseData
      );

      setSimulation(
        scenarioData
      );

      toast.success(
        "Climate scenario simulated."
      );
    } catch (error) {
      toast.error(
        error.message
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLocationSelect(
    location
  ) {
    setSelectedLocation(
      location
    );

    setBaseline(null);
    setSimulation(null);
  }

  const baselineRisk =
    Number(
      simulation
        ?.baseline
        ?.riskPercentage ??
        baseline
          ?.climateRiskScore ??
        0
    );

  const scenarioRisk =
    Number(
      simulation
        ?.simulated
        ?.riskPercentage ??
        0
    );

  const baselineResilience =
    Number(
      simulation
        ?.baseline
        ?.resilienceScore ??
        baseline
          ?.resilienceScore ??
        0
    );

  const scenarioResilience =
    Number(
      simulation
        ?.simulated
        ?.resilienceScore ??
        0
    );

  const riskChange =
    scenarioRisk -
    baselineRisk;

  const resilienceChange =
    scenarioResilience -
    baselineResilience;

  return (
    <div className="page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">
            CLIMATE TECH
          </span>

          <h1>
            Climate Scenario
            <br />
            Lab
          </h1>

          <p>
            Explore how climate
            events could change hazard
            exposure and resilience
            at a selected location.
          </p>
        </div>
      </section>

      <section className="scenario-layout">
        <div className="panel scenario-controls">
          <div className="panel-header compact">
            <div>
              <span className="panel-kicker">
                SCENARIO
              </span>

              <h2>
                Select a climate event
              </h2>
            </div>
          </div>

          <div className="scenario-list">
            {scenarios.map(
              (scenario) => (
                <button
                  key={
                    scenario.id
                  }
                  className={`scenario-option ${
                    selectedScenario ===
                    scenario.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedScenario(
                      scenario.id
                    )
                  }
                >
                  <span>
                    {
                      scenario.label
                    }
                  </span>

                  <small>
                    {
                      scenario.description
                    }
                  </small>
                </button>
              )
            )}
          </div>

          <div className="selected-coordinate">
            <MapPin
              size={16}
            />

            <span>
              {selectedLocation[0].toFixed(
                4
              )}
              ,
              {" "}
              {selectedLocation[1].toFixed(
                4
              )}
            </span>
          </div>

          <button
            className="button button-primary full-width"
            onClick={() =>
              runSimulation()
            }
            disabled={loading}
          >
            <Play size={17} />

            {loading
              ? "Running simulation..."
              : "Run climate simulation"}
          </button>
        </div>

        <div className="panel scenario-map">
          <ClimateMap
            center={
              selectedLocation
            }
            selectedLocation={
              selectedLocation
            }
            onSelectLocation={
              handleLocationSelect
            }
            height={520}
          />
        </div>
      </section>

      {simulation && (
        <>
          <section className="scenario-comparison">
            <div className="comparison-card baseline-card">
              <span>
                BASELINE
              </span>

              <strong>
                {baselineRisk.toFixed(
                  0
                )}
                %
              </strong>

              <small>
                Current estimated
                hazard risk
              </small>

              <div className="comparison-score">
                Resilience{" "}
                {baselineResilience}
                /100
              </div>
            </div>

            <div className="comparison-arrow">
              <TrendingUp
                size={24}
              />
            </div>

            <div className="comparison-card scenario-card">
              <span>
                {
                  scenarios.find(
                    (item) =>
                      item.id ===
                      selectedScenario
                  )?.label
                }
              </span>

              <strong>
                {scenarioRisk.toFixed(
                  0
                )}
                %
              </strong>

              <small>
                Simulated decision-
                support risk
              </small>

              <div className="comparison-score">
                Resilience{" "}
                {scenarioResilience}
                /100
              </div>
            </div>
          </section>

          <section className="impact-grid">
            <ImpactCard
              icon={
                <ShieldAlert
                  size={20}
                />
              }
              label="Risk change"
              value={`${
                riskChange >=
                0
                  ? "+"
                  : ""
              }${riskChange.toFixed(
                0
              )}%`}
              description={
                riskChange >=
                0
                  ? "Higher hazard exposure under the selected scenario."
                  : "Lower modeled risk under the selected scenario."
              }
              danger={
                riskChange >
                0
              }
            />

            <ImpactCard
              icon={
                <TrendingDown
                  size={20}
                />
              }
              label="Resilience change"
              value={`${
                resilienceChange >=
                0
                  ? "+"
                  : ""
              }${resilienceChange.toFixed(
                0
              )}`}
              description="Change in the decision-support resilience score."
              danger={
                resilienceChange <
                0
              }
            />

            <ImpactCard
              icon={
                <CloudRain
                  size={20}
                />
              }
              label="Scenario"
              value={
                scenarios.find(
                  (item) =>
                    item.id ===
                    selectedScenario
                )?.label
              }
              description="Scenario selected for this simulation."
            />
          </section>

          <div className="disclaimer">
            <ShieldAlert
              size={17}
            />

            <span>
              Scenario results are
              decision-support
              estimates. The underlying
              ML model prediction is
              preserved and is not
              retrained or altered by
              this simulation.
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function ImpactCard({
  icon,
  label,
  value,
  description,
  danger,
}) {
  return (
    <div
      className={`impact-card ${
        danger
          ? "impact-danger"
          : ""
      }`}
    >
      <div className="impact-icon">
        {icon}
      </div>

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        {description}
      </small>
    </div>
  );
}