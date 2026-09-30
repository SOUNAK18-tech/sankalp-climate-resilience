"use strict";

const express = require("express");

const {
    getClimateHealth,
    getClimateRisk,
    simulateClimateScenario,
    getDashboardSummary,
    createClimateAlert,
    getClimateAlerts,
} = require("../controllers/climateController");

const router = express.Router();

// -----------------------------------------------------------------------------
// CLIMATE SERVICE
// -----------------------------------------------------------------------------

router.get(
    "/health",
    getClimateHealth
);

// -----------------------------------------------------------------------------
// LOCATION CLIMATE RISK
// GET /api/climate/risk?lat=25.5&lon=93
// -----------------------------------------------------------------------------

router.get(
    "/risk",
    getClimateRisk
);

// -----------------------------------------------------------------------------
// DASHBOARD SUMMARY
// GET /api/climate/summary?lat=25.5&lon=93
// -----------------------------------------------------------------------------

router.get(
    "/summary",
    getDashboardSummary
);

// -----------------------------------------------------------------------------
// SCENARIO SIMULATION
// POST /api/climate/scenario
// -----------------------------------------------------------------------------

router.post(
    "/scenario",
    simulateClimateScenario
);

// -----------------------------------------------------------------------------
// ALERTS
// -----------------------------------------------------------------------------

router.get(
    "/alerts",
    getClimateAlerts
);

router.post(
    "/alerts",
    createClimateAlert
);

module.exports = router;