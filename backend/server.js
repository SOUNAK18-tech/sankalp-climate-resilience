"use strict";

const path = require("path");
require("dotenv").config({
    path: path.join(__dirname, ".env"),
});
require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { Server } = require("socket.io");

// MongoDB
const mongoose = require("mongoose");

// Routes
const authRoutes = require("./routes/authRoutes");
const geocodeRoutes = require("./routes/geocodeRoutes");
const landslideRoutes = require("./routes/landslideRoutes");
const routeRiskRoutes = require("./routes/routeRiskRoutes");
const climateRoutes = require("./routes/climateRoutes");

// -----------------------------------------------------------------------------
// CONFIGURATION
// -----------------------------------------------------------------------------

const PORT = process.env.PORT || 5000;

const MONGODB_URI =
    process.env.MONGODB_URI ||
    process.env.MONGO_URL;

const RISK_ENGINE_URL =
    process.env.RISK_ENGINE_URL ||
    "http://localhost:8000";

// -----------------------------------------------------------------------------
// EXPRESS APP
// -----------------------------------------------------------------------------

const app = express();
const httpServer = http.createServer(app);

// -----------------------------------------------------------------------------
// SOCKET.IO
// -----------------------------------------------------------------------------

const allowedOrigins = (
    process.env.FRONTEND_URL ||
    "http://localhost:5173"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
});

app.set("io", io);

// -----------------------------------------------------------------------------
// MIDDLEWARE
// -----------------------------------------------------------------------------

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin",
        },
    })
);

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

app.use(
    express.json({
        limit: "2mb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
    })
);

// -----------------------------------------------------------------------------
// REQUEST LOGGING
// -----------------------------------------------------------------------------

app.use((req, res, next) => {
    console.log(
        `${new Date().toISOString()} ${req.method} ${req.originalUrl}`
    );

    next();
});

// -----------------------------------------------------------------------------
// HEALTH CHECK
// -----------------------------------------------------------------------------

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        service: "SANKALP Climate Intelligence API",
        status: "ok",
        riskEngine: RISK_ENGINE_URL,
        timestamp: new Date().toISOString(),
    });
});

// -----------------------------------------------------------------------------
// API INFORMATION
// -----------------------------------------------------------------------------

app.get("/api", (req, res) => {
    res.json({
        success: true,
        name: "Climate Resilience & Mobility Intelligence Platform",
        version: "1.0.0",
        theme: "Climate Tech",
        description:
            "AI-powered climate-risk, accessibility and resilient mobility intelligence platform.",
        services: {
            climate: "/api/climate",
            landslide: "/api/landslide",
            routeRisk: "/api/route-risk",
            geocode: "/api/geocode",
            auth: "/api/auth",
        },
    });
});

// -----------------------------------------------------------------------------
// ROUTES
// -----------------------------------------------------------------------------

app.use("/api/auth", authRoutes);

app.use("/api/climate", climateRoutes);

app.use("/api/landslide", landslideRoutes);

app.use("/api/route-risk", routeRiskRoutes);

app.use("/api/geocode", geocodeRoutes);

// -----------------------------------------------------------------------------
// SOCKET CONNECTIONS
// -----------------------------------------------------------------------------

io.on("connection", (socket) => {
    console.log(`Climate dashboard connected: ${socket.id}`);

    socket.join("climate-dashboard");

    socket.on("join_climate_dashboard", () => {
        socket.join("climate-dashboard");
    });

    socket.on("disconnect", () => {
        console.log(`Climate dashboard disconnected: ${socket.id}`);
    });
});

// -----------------------------------------------------------------------------
// 404 HANDLER
// -----------------------------------------------------------------------------

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});

// -----------------------------------------------------------------------------
// GLOBAL ERROR HANDLER
// -----------------------------------------------------------------------------

app.use((err, req, res, next) => {
    console.error("Unhandled backend error:", err);

    res.status(err.status || 500).json({
        success: false,
        message:
            err.message ||
            "Internal server error",
    });
});

// -----------------------------------------------------------------------------
// MONGODB
// -----------------------------------------------------------------------------

async function connectMongoDB() {
    if (!MONGODB_URI) {
        console.warn(
            "⚠ MONGODB_URI/MONGO_URL not configured."
        );

        console.warn(
            "⚠ Running without MongoDB persistence."
        );

        return false;
    }

    try {
        mongoose.set("strictQuery", false);

        await mongoose.connect(
            MONGODB_URI,
            {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 30000,
            }
        );

        console.log(
            `✅ MongoDB connected: ${mongoose.connection.host}`
        );

        return true;
    } catch (error) {
        console.warn(
            `⚠ MongoDB unavailable: ${error.message}`
        );

        console.warn(
            "⚠ Climate APIs will continue using non-persistent operation where possible."
        );

        return false;
    }
}

// -----------------------------------------------------------------------------
// START SERVER
// -----------------------------------------------------------------------------

async function startServer() {
    await connectMongoDB();

    httpServer.listen(PORT, () => {
        console.log("");
        console.log(
            "=================================================="
        );
        console.log(
            " SANKALP CLIMATE INTELLIGENCE BACKEND"
        );
        console.log(
            "=================================================="
        );
        console.log(
            `Express API:       http://localhost:${PORT}`
        );
        console.log(
            `Risk Engine:       ${RISK_ENGINE_URL}`
        );
        console.log(
            `Health:            http://localhost:${PORT}/health`
        );
        console.log(
            `Climate API:       http://localhost:${PORT}/api/climate`
        );
        console.log(
            "=================================================="
        );
        console.log("");
    });
}

startServer();

module.exports = app;