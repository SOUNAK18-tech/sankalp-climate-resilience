import { API_BASE } from "../config";

export const BASE_URL = API_BASE;

/* -------------------------------------------------------------------------- */
/* Generic request helper                                                     */
/* -------------------------------------------------------------------------- */

async function request(path, options = {}) {
  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers = {
    ...(isFormData
      ? {}
      : {
          "Content-Type": "application/json",
        }),
    ...(options.headers || {}),
  };

  const response = await fetch(
    `${BASE_URL}${path}`,
    {
      ...options,
      headers,
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Request failed with HTTP ${response.status}`
    );
  }

  return data;
}

/* -------------------------------------------------------------------------- */
/* Climate intelligence                                                       */
/* -------------------------------------------------------------------------- */

export async function getClimateRisk(
  latitude,
  longitude
) {
  return request(
    `/api/climate/risk?lat=${encodeURIComponent(
      latitude
    )}&lon=${encodeURIComponent(longitude)}`
  );
}

export async function getClimateSummary(
  latitude,
  longitude
) {
  return request(
    `/api/climate/summary?lat=${encodeURIComponent(
      latitude
    )}&lon=${encodeURIComponent(longitude)}`
  );
}

/* -------------------------------------------------------------------------- */
/* Scenario simulation                                                        */
/* -------------------------------------------------------------------------- */

export async function simulateClimateScenario(
  payload
) {
  return request(
    "/api/climate/scenario",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/* -------------------------------------------------------------------------- */
/* Climate alerts                                                             */
/* -------------------------------------------------------------------------- */

export async function getClimateAlerts(
  limit = 20
) {
  return request(
    `/api/climate/alerts?limit=${limit}`
  );
}

export async function createClimateAlert(
  payload
) {
  return request(
    "/api/climate/alerts",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/* -------------------------------------------------------------------------- */
/* Geocoding                                                                  */
/* -------------------------------------------------------------------------- */

export async function geocodePlace(query) {
  if (!query?.trim()) {
    return {
      success: true,
      results: [],
    };
  }

  return request(
    `/api/geocode?q=${encodeURIComponent(
      query.trim()
    )}`
  );
}

export async function reverseGeocode(
  latitude,
  longitude
) {
  return request(
    `/api/geocode/reverse?lat=${encodeURIComponent(
      latitude
    )}&lon=${encodeURIComponent(
      longitude
    )}`
  );
}

/* -------------------------------------------------------------------------- */
/* Route risk                                                                 */
/* -------------------------------------------------------------------------- */

export async function getRouteRisk(points) {
  return request(
    "/api/route-risk",
    {
      method: "POST",
      body: JSON.stringify({
        points,
      }),
    }
  );
}

/* -------------------------------------------------------------------------- */
/* OSRM route calculation                                                     */
/*                                                                            */
/* OSRM gives us the physical route geometry.                                 */
/* Express then sends sampled route points to the existing ML engine.        */
/* -------------------------------------------------------------------------- */

export async function getDrivingRoute(
  start,
  end
) {
  const url =
    "https://router.project-osrm.org/route/v1/driving/" +
    `${start[1]},${start[0]};${end[1]},${end[0]}` +
    "?overview=full&geometries=geojson";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      "Unable to calculate the driving route."
    );
  }

  const data = await response.json();

  if (
    data.code !== "Ok" ||
    !data.routes?.length
  ) {
    throw new Error(
      "No route could be calculated."
    );
  }

  const route =
    data.routes[0];

  const coordinates =
    route.geometry.coordinates.map(
      ([longitude, latitude]) => [
        latitude,
        longitude,
      ]
    );

  return {
    coordinates,
    distanceKm:
      route.distance / 1000,
    durationMinutes:
      route.duration / 60,
  };
}

/* -------------------------------------------------------------------------- */
/* Sample a route for the ML batch endpoint                                   */
/* -------------------------------------------------------------------------- */

export function sampleRoutePoints(
  coordinates,
  maxPoints = 30
) {
  if (!Array.isArray(coordinates)) {
    return [];
  }

  if (
    coordinates.length <=
    maxPoints
  ) {
    return coordinates.map(
      ([latitude, longitude]) => ({
        lat: latitude,
        lon: longitude,
      })
    );
  }

  const points = [];

  for (
    let i = 0;
    i < maxPoints;
    i++
  ) {
    const ratio =
      i /
      (maxPoints - 1);

    const index = Math.round(
      ratio *
        (coordinates.length - 1)
    );

    const [
      latitude,
      longitude,
    ] = coordinates[index];

    points.push({
      lat: latitude,
      lon: longitude,
    });
  }

  return points;
}