"use strict";

const ClimateAlert =
    require("../models/ClimateAlert");

const RISK_ENGINE_URL =
    process.env.RISK_ENGINE_URL ||
    "http://localhost:8000";

const getRisk = async (req, res) => {
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
            return res.status(
                response.status
            ).json({
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
                location: {
                    latitude,
                    longitude,
                },
                message:
                    data.message,
            });
        }

        /*
         * Save a climate alert only for
         * genuinely high-risk predictions.
         */
        if (
            data.risk_category ===
                "High" ||
            data.risk_category ===
                "Very High"
        ) {
            ClimateAlert.create({
                title:
                    "Elevated Landslide Risk",

                message:
                    `${data.risk_category} landslide risk detected at the selected location.`,

                hazardType:
                    "landslide",

                severity:
                    data.risk_category ===
                    "Very High"
                        ? "critical"
                        : "high",

                latitude:
                    data.latitude,

                longitude:
                    data.longitude,

                riskPercentage:
                    data.risk_percentage,
            }).catch((error) => {
                console.error(
                    "Climate alert save failed:",
                    error.message
                );
            });
        }

        res.status(200).json({
            success: true,

            location: {
                latitude:
                    data.latitude,
                longitude:
                    data.longitude,
            },

            hazard: {
                type:
                    "landslide",

                prediction:
                    data.prediction,

                riskPercentage:
                    data.risk_percentage,

                riskCategory:
                    data.risk_category,
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

            rainfall: {
                value:
                    data.rainfall,

                source:
                    data.rainfall_source ||
                    "risk-engine",
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
        });
    } catch (error) {
        console.error(
            "Landslide prediction error:",
            error
        );

        res.status(503).json({
            success: false,
            message:
                `Could not reach climate risk engine: ${error.message}`,
        });
    }
};

module.exports = {
    getRisk,
};