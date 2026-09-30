import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import {
  useEffect,
} from "react";

import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [
  26.1445,
  91.7362,
];

function MapClickHandler({
  onSelect,
}) {
  useMapEvents({
    click(event) {
      if (!onSelect) return;

      onSelect([
        event.latlng.lat,
        event.latlng.lng,
      ]);
    },
  });

  return null;
}

function MapViewport({
  center,
}) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;

    map.flyTo(
      center,
      Math.max(
        map.getZoom(),
        9
      ),
      {
        duration: 0.8,
      }
    );
  }, [center, map]);

  return null;
}

function getRiskColor(
  percentage
) {
  const value =
    Number(percentage) || 0;

  if (value >= 80)
    return "#c62828";

  if (value >= 60)
    return "#ef6c00";

  if (value >= 40)
    return "#d69e00";

  return "#16835b";
}

export function ClimateMap({
  center = DEFAULT_CENTER,
  selectedLocation,
  riskData,
  route = [],
  routeRisk,
  onSelectLocation,
  height = 520,
}) {
  const riskColor =
    getRiskColor(
      riskData?.climateRisk
        ?.percentage
    );

  const riskPoints =
    routeRisk?.points ||
    [];

  return (
    <div
      className="climate-map"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler
          onSelect={
            onSelectLocation
          }
        />

        <MapViewport
          center={
            selectedLocation ||
            center
          }
        />

        {selectedLocation && (
          <CircleMarker
            center={
              selectedLocation
            }
            radius={12}
            pathOptions={{
              color: riskColor,
              fillColor:
                riskColor,
              fillOpacity: 0.32,
              weight: 3,
            }}
          >
            <Popup>
              <div className="map-popup">
                <strong>
                  Climate Risk
                </strong>

                {riskData ? (
                  <>
                    <span>
                      {
                        riskData
                          .climateRisk
                          ?.category
                      }
                    </span>

                    <span>
                      Risk:{" "}
                      {
                        riskData
                          .climateRisk
                          ?.percentage
                      }
                      %
                    </span>

                    <span>
                      Resilience:{" "}
                      {
                        riskData
                          .resilience
                          ?.score
                      }
                      /100
                    </span>
                  </>
                ) : (
                  <span>
                    Loading climate
                    analysis...
                  </span>
                )}
              </div>
            </Popup>
          </CircleMarker>
        )}

        {route.length > 1 && (
          <Polyline
            positions={route}
            pathOptions={{
              color:
                "#0f766e",
              weight: 6,
              opacity: 0.85,
            }}
          />
        )}

        {riskPoints.map(
          (point, index) => {
            if (
              !point ||
              !Number.isFinite(
                Number(
                  point.latitude ??
                    point.lat
                )
              ) ||
              !Number.isFinite(
                Number(
                  point.longitude ??
                    point.lon
                )
              )
            ) {
              return null;
            }

            const lat =
              Number(
                point.latitude ??
                  point.lat
              );

            const lon =
              Number(
                point.longitude ??
                  point.lon
              );

            const percentage =
              Number(
                point.risk_percentage ??
                  0
              );

            return (
              <CircleMarker
                key={`${lat}-${lon}-${index}`}
                center={[
                  lat,
                  lon,
                ]}
                radius={6}
                pathOptions={{
                  color:
                    getRiskColor(
                      percentage
                    ),
                  fillColor:
                    getRiskColor(
                      percentage
                    ),
                  fillOpacity:
                    0.75,
                  weight: 1,
                }}
              >
                <Popup>
                  <div className="map-popup">
                    <strong>
                      Route Risk Point
                    </strong>

                    <span>
                      Risk:{" "}
                      {Math.round(
                        percentage
                      )}
                      %
                    </span>

                    <span>
                      {
                        point.risk_category
                      }
                    </span>
                  </div>
                </Popup>
              </CircleMarker>
            );
          }
        )}
      </MapContainer>

      <div className="map-overlay">
        <div className="map-layer-title">
          Climate risk intelligence
        </div>

        <div className="map-legend">
          <span>
            <i
              style={{
                background:
                  "#16835b",
              }}
            />
            Lower risk
          </span>

          <span>
            <i
              style={{
                background:
                  "#d69e00",
              }}
            />
            Moderate
          </span>

          <span>
            <i
              style={{
                background:
                  "#ef6c00",
              }}
            />
            High
          </span>

          <span>
            <i
              style={{
                background:
                  "#c62828",
              }}
            />
            Very high
          </span>
        </div>

        {onSelectLocation && (
          <small>
            Click anywhere on the map
            to analyze climate risk.
          </small>
        )}
      </div>
    </div>
  );
}

export default ClimateMap;