"use strict";

const ClimateAlert = require("../models/ClimateAlert");

const RISK_ENGINE_URL =
    process.env.RISK_ENGINE_URL ||
    "http://localhost:8000";

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function clamp(value, min, max) {
    return Math.min(
        Math.max(value, min),
        max
    );
}

function riskToNumeric(category) {
    switch (String(category).toLowerCase()) {
        case "very high":
            return 95;

        case "high":
            return 75;

        case "moderate":
            return 50;

        case "low":
            return 25;

        case "very low":
            return 10;

        default:
            return 0;
    }
}

function calculateClimateResilienceScore({
    riskPercentage = 0,
    rainfall = 0,
    slope = 0,
    distToRoad = 0,
}) {
    /*
     * This is a decision-support score.
     * It does NOT replace the ML model.
     *
     * The ML risk percentage remains the primary hazard signal.
     */

    const riskScore =
        clamp(Number(riskPercentage), 0, 100);

    const rainfallPenalty =
        clamp(
            Number(rainfall) * 1.5,
            0,
            20
        );

    const slopePenalty =
        clamp(
            Number(slope) * 0.8,
            0,
            20
        );

    const roadPenalty =
        clamp(
            Number(distToRoad) / 500,
            0,
            10
        );

    const resilience =
        100 -
        (
            riskScore * 0.55 +
            rainfallPenalty +
            slopePenalty +
            roadPenalty
        );

    return Math.round(
        clamp(resilience, 0, 100)
    );
}

function getResilienceLabel(score) {
    if (score >= 80) return "Highly Resilient";
    if (score >= 60) return "Resilient";
    if (score >= 40) return "Moderately Resilient";
    if (score >= 20) return "Vulnerable";

    return "Highly Vulnerable";
}

function getHazardPriority(category) {
    const normalized =
        String(category || "").toLowerCase();

    if (
        normalized === "very high" ||
        normalized === "high"
    ) {
        return "HIGH";
    }

    if (normalized === "moderate") {
        return "MEDIUM";
    }

    return "LOW";
}

// -----------------------------------------------------------------------------
// GET CLIMATE HEALTH
// -----------------------------------------------------------------------------

const getClimateHealth = async (req, res) => {
    try {
        const response =
            await fetch(
                `${RISK_ENGINE_URL}/health`
            );

        const data =
            await response.json();

        res.status(200).json({
            success: true,
            climatePlatform: "operational",
            riskEngine: data,
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            climatePlatform: "operational",
            riskEngine: "unavailable",
            message: error.message,
        });
    }
};

// -----------------------------------------------------------------------------
// GET CLIMATE RISK AT LOCATION
// -----------------------------------------------------------------------------

const getClimateRisk = async (req, res) => {
    try {
        const {
            lat,
            lon,
        } = req.query;

        if (
            lat === undefined ||
            lon === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "lat and lon are required",
            });
        }

        const latitude = Number(lat);
        const longitude = Number(lon);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "lat and lon must be valid numbers",
            });
        }

        const response =
            await fetch(
                `${RISK_ENGINE_URL}/predict?lat=${latitude}&lon=${longitude}`
            );

        const data =
            await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                message:
                    data.detail ||
                    "Risk engine error",
            });
        }

        if (data.error === "outside_coverage") {
            return res.status(200).json({
                success: true,
                location: {
                    latitude,
                    longitude,
                },
                coverage: "outside",
                message: data.message,
            });
        }

        const resilienceScore =
            calculateClimateResilienceScore({
                riskPercentage:
                    data.risk_percentage,
                rainfall:
                    data.rainfall,
                slope:
                    data.slope,
                distToRoad:
                    data.dist_to_road,
            });

        const result = {
            success: true,

            location: {
                latitude:
                    data.latitude,
                longitude:
                    data.longitude,
            },

            climateRisk: {
                category:
                    data.risk_category,
                percentage:
                    data.risk_percentage,
                priority:
                    getHazardPriority(
                        data.risk_category
                    ),
            },

            terrain: {
                elevation:
                    data.elevation,
                slope:
                    data.slope,
                aspect:
                    data.aspect,
                distanceToRoad:
                    data.dist_to_road,
            },

            weather: {
                rainfall:
                    data.rainfall,
                source:
                    data.rainfall_source ||
                    "risk-engine",
            },

            resilience: {
                score:
                    resilienceScore,
                label:
                    getResilienceLabel(
                        resilienceScore
                    ),
            },

            model: {
                prediction:
                    data.prediction,
                riskPercentage:
                    data.risk_percentage,
                category:
                    data.risk_category,
            },

            generatedAt:
                new Date().toISOString(),
        };

        res.status(200).json(result);
    } catch (error) {
        console.error(
            "Climate risk error:",
            error
        );

        res.status(503).json({
            success: false,
            message:
                `Climate risk engine unavailable: ${error.message}`,
        });
    }
};

// -----------------------------------------------------------------------------
// CLIMATE SCENARIO SIMULATOR
// -----------------------------------------------------------------------------

const simulateClimateScenario = async (req, res) => {
    try {
        const {
            lat,
            lon,
            scenario = "normal",
            intensity = 1,
        } = req.body;

        if (
            !Number.isFinite(Number(lat)) ||
            !Number.isFinite(Number(lon))
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Valid lat and lon are required",
            });
        }

        const latitude = Number(lat);
        const longitude = Number(lon);

        const scenarioIntensity =
            clamp(
                Number(intensity) || 1,
                0.5,
                2
            );

        const response =
            await fetch(
                `${RISK_ENGINE_URL}/predict?lat=${latitude}&lon=${longitude}`
            );

        const base =
            await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                message:
                    base.detail ||
                    "Risk engine error",
            });
        }

        if (
            base.error ===
            "outside_coverage"
        ) {
            return res.status(200).json({
                success: true,
                coverage: "outside",
                scenario,
                message: base.message,
            });
        }

        /*
         * The scenario layer is deliberately separate
         * from the ML model.
         *
         * The original ML prediction remains untouched.
         * We only estimate how a user-selected
         * climate scenario could change the
         * decision-support risk level.
         */

        const scenarioMultipliers = {
            normal: 1,
            heavy_rainfall: 1.15,
            extreme_rainfall: 1.3,
            flood: 1.45,
            landslide_event: 1.55,
        };

        const multiplier =
            scenarioMultipliers[
                scenario
            ] || 1;

        const adjustedRisk =
            clamp(
                Number(base.risk_percentage) *
                    multiplier *
                    scenarioIntensity,
                0,
                100
            );

        let adjustedCategory;

        if (adjustedRisk >= 80) {
            adjustedCategory = "Very High";
        } else if (adjustedRisk >= 60) {
            adjustedCategory = "High";
        } else if (adjustedRisk >= 40) {
            adjustedCategory = "Moderate";
        } else if (adjustedRisk >= 20) {
            adjustedCategory = "Low";
        } else {
            adjustedCategory = "Very Low";
        }

        const baseResilience =
            calculateClimateResilienceScore({
                riskPercentage:
                    base.risk_percentage,
                rainfall:
                    base.rainfall,
                slope:
                    base.slope,
                distToRoad:
                    base.dist_to_road,
            });

        const scenarioResilience =
            clamp(
                Math.round(
                    baseResilience -
                        (
                            adjustedRisk -
                            Number(
                                base.risk_percentage
                            )
                        ) *
                            0.65
                ),
                0,
                100
            );

        const riskIncrease =
            Math.max(
                0,
                Math.round(
                    adjustedRisk -
                    Number(
                        base.risk_percentage
                    )
                )
            );

        const responsePayload = {
            success: true,

            location: {
                latitude,
                longitude,
            },

            scenario: {
                name: scenario,
                intensity:
                    scenarioIntensity,
            },

            baseline: {
                riskPercentage:
                    base.risk_percentage,
                riskCategory:
                    base.risk_category,
                resilienceScore:
                    baseResilience,
            },

            simulated: {
                riskPercentage:
                    Math.round(
                        adjustedRisk * 100
                    ) / 100,

                riskCategory:
                    adjustedCategory,

                resilienceScore:
                    scenarioResilience,

                resilienceLabel:
                    getResilienceLabel(
                        scenarioResilience
                    ),
            },

            impact: {
                riskIncreasePercentage:
                    riskIncrease,

                resilienceReduction:
                    Math.max(
                        0,
                        baseResilience -
                            scenarioResilience
                    ),

                disruptionLevel:
                    getHazardPriority(
                        adjustedCategory
                    ),
            },

            disclaimer:
                "Scenario results are decision-support estimates. The underlying ML model prediction is unchanged.",

            generatedAt:
                new Date().toISOString(),
        };

        res.status(200).json(
            responsePayload
        );
    } catch (error) {
        console.error(
            "Scenario simulation error:",
            error
        );

        res.status(503).json({
            success: false,
            message:
                `Scenario simulation unavailable: ${error.message}`,
        });
    }
};

// -----------------------------------------------------------------------------
// CLIMATE DASHBOARD SUMMARY
// -----------------------------------------------------------------------------

const getDashboardSummary = async (req, res) => {
    try {
        const {
            lat,
            lon,
        } = req.query;

        if (
            !Number.isFinite(Number(lat)) ||
            !Number.isFinite(Number(lon))
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "lat and lon are required",
            });
        }

        const response =
            await fetch(
                `${RISK_ENGINE_URL}/predict?lat=${Number(lat)}&lon=${Number(lon)}`
            );

        const data =
            await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                message:
                    data.detail ||
                    "Risk engine error",
            });
        }

        if (
            data.error ===
            "outside_coverage"
        ) {
            return res.status(200).json({
                success: true,
                coverage: "outside",
                message: data.message,
            });
        }

        const resilienceScore =
            calculateClimateResilienceScore({
                riskPercentage:
                    data.risk_percentage,
                rainfall:
                    data.rainfall,
                slope:
                    data.slope,
                distToRoad:
                    data.dist_to_road,
            });

        const riskScore =
            riskToNumeric(
                data.risk_category
            );

        res.status(200).json({
            success: true,

            climateRiskScore:
                Math.round(riskScore),

            climateRiskCategory:
                data.risk_category,

            resilienceScore,

            resilienceLabel:
                getResilienceLabel(
                    resilienceScore
                ),

            accessibilityScore:
                Math.max(
                    0,
                    Math.round(
                        100 -
                        Number(
                            data.risk_percentage
                        )
                    )
                ),

            hazardPriority:
                getHazardPriority(
                    data.risk_category
                ),

            weather: {
                rainfall:
                    data.rainfall,
                source:
                    data.rainfall_source,
            },

            terrain: {
                elevation:
                    data.elevation,
                slope:
                    data.slope,
                aspect:
                    data.aspect,
            },

            location: {
                latitude:
                    data.latitude,
                longitude:
                    data.longitude,
            },

            generatedAt:
                new Date().toISOString(),
        });
    } catch (error) {
        console.error(
            "Dashboard summary error:",
            error
        );

        res.status(503).json({
            success: false,
            message:
                `Dashboard service unavailable: ${error.message}`,
        });
    }
};

// -----------------------------------------------------------------------------
// CREATE CLIMATE ALERT
// -----------------------------------------------------------------------------

const createClimateAlert = async (req, res) => {
    try {
        const {
            title,
            message,
            hazardType = "climate",
            severity = "medium",
            latitude,
            longitude,
            riskPercentage,
        } = req.body;

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message:
                    "title and message are required",
            });
        }

        const alert =
            await ClimateAlert.create({
                title,
                message,
                hazardType,
                severity,
                latitude:
                    Number.isFinite(
                        Number(latitude)
                    )
                        ? Number(latitude)
                        : undefined,
                longitude:
                    Number.isFinite(
                        Number(longitude)
                    )
                        ? Number(longitude)
                        : undefined,
                riskPercentage:
                    Number.isFinite(
                        Number(
                            riskPercentage
                        )
                    )
                        ? Number(
                            riskPercentage
                        )
                        : undefined,
            });

        const io =
            req.app.get("io");

        if (io) {
            io.to(
                "climate-dashboard"
            ).emit(
                "climate_alert",
                alert
            );
        }

        res.status(201).json({
            success: true,
            alert,
        });
    } catch (error) {
        console.error(
            "Create climate alert error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// -----------------------------------------------------------------------------
// GET CLIMATE ALERTS
// -----------------------------------------------------------------------------

const getClimateAlerts = async (req, res) => {
    try {
        const limit =
            Math.min(
                Number(req.query.limit) || 20,
                100
            );

        const alerts =
            await ClimateAlert.find()
                .sort({
                    createdAt: -1,
                })
                .limit(limit)
                .lean();

        res.status(200).json({
            success: true,
            alerts,
            total:
                alerts.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getClimateHealth,
    getClimateRisk,
    simulateClimateScenario,
    getDashboardSummary,
    createClimateAlert,
    getClimateAlerts,
};