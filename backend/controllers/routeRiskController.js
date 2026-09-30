"use strict";

const RISK_ENGINE_URL =
    process.env.RISK_ENGINE_URL ||
    "http://localhost:8000";

function getRiskWeight(category) {
    switch (
        String(category || "")
            .toLowerCase()
    ) {
        case "very high":
            return 1.0;

        case "high":
            return 0.8;

        case "moderate":
            return 0.5;

        case "low":
            return 0.25;

        case "very low":
            return 0.1;

        default:
            return 0;
    }
}

function calculateRouteResilience(results) {
    const validResults =
        results.filter(Boolean);

    if (
        validResults.length === 0
    ) {
        return {
            score: 0,
            label: "No Data",
        };
    }

    const riskValues =
        validResults.map(
            (result) =>
                Number(
                    result.risk_percentage
                ) || 0
        );

    const averageRisk =
        riskValues.reduce(
            (sum, value) =>
                sum + value,
            0
        ) /
        riskValues.length;

    const maximumRisk =
        Math.max(
            ...riskValues
        );

    const highRiskCount =
        validResults.filter(
            (result) =>
                getRiskWeight(
                    result.risk_category
                ) >= 0.8
        ).length;

    const highRiskRatio =
        highRiskCount /
        validResults.length;

    /*
     * Resilience is a decision-support
     * metric derived from the ML outputs.
     *
     * The ML predictions themselves
     * are not changed.
     */

    const score =
        100 -
        (
            averageRisk * 0.55 +
            maximumRisk * 0.25 +
            highRiskRatio * 20
        );

    const finalScore =
        Math.max(
            0,
            Math.min(
                100,
                Math.round(score)
            )
        );

    let label;

    if (finalScore >= 80) {
        label = "Highly Resilient";
    } else if (finalScore >= 60) {
        label = "Resilient";
    } else if (finalScore >= 40) {
        label = "Moderately Resilient";
    } else if (finalScore >= 20) {
        label = "Vulnerable";
    } else {
        label = "Highly Vulnerable";
    }

    return {
        score: finalScore,
        label,
        averageRisk:
            Math.round(
                averageRisk * 100
            ) / 100,
        maximumRisk:
            Math.round(
                maximumRisk * 100
            ) / 100,
        highRiskPoints:
            highRiskCount,
        totalPoints:
            validResults.length,
    };
}

const getRouteRisk =
    async (req, res) => {
        try {
            const {
                points,
            } = req.body;

            if (
                !Array.isArray(points) ||
                points.length === 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "points must be a non-empty array",
                });
            }

            const validPoints =
                points.every(
                    (point) =>
                        point &&
                        Number.isFinite(
                            Number(
                                point.lat
                            )
                        ) &&
                        Number.isFinite(
                            Number(
                                point.lon
                            )
                        )
                );

            if (!validPoints) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Every point must contain valid lat and lon values",
                });
            }

            const response =
                await fetch(
                    `${RISK_ENGINE_URL}/predict-batch`,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                points,
                            }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                return res.status(
                    response.status
                ).json({
                    success: false,
                    message:
                        data.detail ||
                        "Risk engine error",
                });
            }

            const results =
                Array.isArray(
                    data.results
                )
                    ? data.results
                    : [];

            const validResults =
                results.filter(
                    Boolean
                );

            const resilience =
                calculateRouteResilience(
                    results
                );

            const highRiskPoints =
                validResults.filter(
                    (result) =>
                        result.risk_category ===
                            "High" ||
                        result.risk_category ===
                            "Very High"
                );

            const moderateRiskPoints =
                validResults.filter(
                    (result) =>
                        result.risk_category ===
                        "Moderate"
                );

            const lowRiskPoints =
                validResults.filter(
                    (result) =>
                        result.risk_category ===
                            "Low" ||
                        result.risk_category ===
                            "Very Low"
                );

            /*
             * Overall route risk.
             */
            const averageRisk =
                validResults.length
                    ? validResults.reduce(
                          (
                              sum,
                              result
                          ) =>
                              sum +
                              Number(
                                  result.risk_percentage ||
                                      0
                              ),
                          0
                      ) /
                      validResults.length
                    : 0;

            let routeCategory =
                "Very Low";

            if (averageRisk >= 80) {
                routeCategory =
                    "Very High";
            } else if (
                averageRisk >= 60
            ) {
                routeCategory =
                    "High";
            } else if (
                averageRisk >= 40
            ) {
                routeCategory =
                    "Moderate";
            } else if (
                averageRisk >= 20
            ) {
                routeCategory =
                    "Low";
            }

            res.status(200).json({
                success: true,

                points: results,

                routeRisk: {
                    averageRisk:
                        Math.round(
                            averageRisk *
                                100
                        ) / 100,

                    category:
                        routeCategory,

                    highRiskPoints:
                        highRiskPoints.length,

                    moderateRiskPoints:
                        moderateRiskPoints.length,

                    lowRiskPoints:
                        lowRiskPoints.length,

                    analyzedPoints:
                        results.length,

                    validPoints:
                        validResults.length,
                },

                climateResilience:
                    resilience,

                recommendation:
                    getRouteRecommendation(
                        routeCategory,
                        resilience.score
                    ),

                generatedAt:
                    new Date().toISOString(),
            });
        } catch (error) {
            console.error(
                "Route risk error:",
                error
            );

            res.status(503).json({
                success: false,
                message:
                    `Could not reach climate risk engine: ${error.message}`,
            });
        }
    };

function getRouteRecommendation(
    category,
    resilienceScore
) {
    if (
        category === "Very High" ||
        category === "High"
    ) {
        return {
            action:
                "CONSIDER_ALTERNATIVE_ROUTE",

            message:
                "The selected route contains elevated climate-related hazard exposure. Consider an alternative route before travel.",
        };
    }

    if (
        resilienceScore < 60
    ) {
        return {
            action:
                "USE_CAUTION",

            message:
                "The route has moderate climate vulnerability. Monitor weather conditions and consider a more resilient alternative.",
        };
    }

    return {
        action:
            "ROUTE_ACCEPTABLE",

        message:
            "The selected route has comparatively lower climate-risk exposure.",
    };
}

module.exports = {
    getRouteRisk,
};