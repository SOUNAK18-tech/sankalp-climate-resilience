# ClimateResilience AI – SANKALP Climate Edition

A climate-resilience intelligence platform developed for the **SANKALP by Satin Finserv – The Climate Edition** hackathon.

The project transforms an existing logistics and infrastructure intelligence system into a **climate-focused decision-support platform** that helps users understand environmental risks, evaluate routes, simulate climate scenarios, and identify safer and more resilient transportation options.

---

## 🌍 Problem Statement

Climate-related events such as heavy rainfall, landslides and flooding can significantly affect road accessibility, transportation and infrastructure.

Traditional route-planning systems generally focus on distance and travel time, but do not sufficiently consider climate and environmental risks.

**ClimateResilience AI** addresses this gap by combining route information, environmental parameters and an existing machine-learning risk engine to provide climate-aware insights for transportation and infrastructure planning.

---

## 💡 Proposed Solution

ClimateResilience AI provides a unified platform for:

- Climate risk assessment
- Climate-resilient route planning
- Environmental risk visualization
- Climate scenario simulation
- Resilience scoring
- Climate-related alerts
- AI-assisted decision support

The platform allows users to understand not only **which route is available**, but also **which route may be more resilient under different environmental conditions**.

---

## 🚀 Key Features

### 1. Climate Intelligence Dashboard

The dashboard provides an overview of environmental and infrastructure risk for a selected location.

It displays information such as:

- Climate risk score
- Resilience score
- Accessibility score
- Rainfall conditions
- Elevation
- Slope
- Risk classification
- Climate-related decision support

---

### 2. Climate Risk Map

An interactive map provides geographical visualization of climate and infrastructure risk.

Users can:

- Select locations on the map
- View location-specific risk information
- Visualize risk levels
- Identify potentially vulnerable areas
- Inspect environmental parameters

The map is implemented using **React Leaflet**.

---

### 3. Climate-Resilient Route Planner

The route planner allows users to enter a source and destination and obtain a driving route.

The system:

1. Geocodes the selected locations.
2. Generates the route.
3. Samples points along the route.
4. Sends relevant route information to the backend.
5. Uses the existing risk/ML engine for analysis.
6. Calculates route-level risk and resilience information.
7. Highlights potentially high-risk locations.

The goal is to support **climate-aware route selection**, rather than relying only on distance or travel time.

---

### 4. Climate Scenario Lab

The Scenario Lab allows users to explore how route and infrastructure risk may change under different environmental scenarios.

Example scenarios include:

- Normal Conditions
- Heavy Rainfall
- Extreme Rainfall
- Flood Scenario
- Landslide Event

The system compares baseline conditions with the selected scenario and provides decision-support information.

> The scenario layer is designed as a decision-support simulation and does not claim that the underlying ML model independently predicts every type of climate event.

---

### 5. Climate Alerts

The platform provides climate-related alerts for potentially vulnerable locations.

Alerts can communicate:

- Hazard type
- Location
- Severity
- Description
- Relevant risk information

This can help users identify areas requiring additional attention.

---

### 6. Resilience-Based Decision Support

Instead of considering only conventional route information, the platform combines:

- Environmental conditions
- Terrain characteristics
- Climate risk
- Accessibility
- Route-level risk
- Resilience information

to provide more climate-aware transportation and infrastructure insights.

---

## 🧠 Existing ML & Resilience Engine

The project retains the existing:

- Machine-learning engine
- FastAPI services
- Risk prediction components
- Resilience engine
- Python-based processing

These components were kept unchanged wherever possible.

The major transformation was performed at the **frontend and Node.js/Express backend layers**, converting the original logistics-oriented application into a climate-resilience platform.

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────────┐
                    │     React Frontend      │
                    │                         │
                    │  Climate Dashboard      │
                    │  Risk Map                │
                    │  Route Planner           │
                    │  Scenario Lab            │
                    │  Climate Alerts          │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Node.js / Express     │
                    │       Backend           │
                    │                         │
                    │ Climate APIs             │
                    │ Route Risk APIs          │
                    │ Geocoding APIs           │
                    │ Alert APIs               │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     FastAPI / ML        │
                    │    Risk Engine          │
                    │                         │
                    │ Risk Prediction         │
                    │ Resilience Analysis     │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Climate Resilience      │
                    │     Decision Layer      │
                    └─────────────────────────┘