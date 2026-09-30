import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { RoutePlanner } from "./pages/RoutePlanner";
import { ScenarioSimulator } from "./pages/ScenarioSimulator";
import { Alerts } from "./pages/Alerts";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: "#ffffff",
            color: "#16324f",
            border: "1px solid #dce8e3",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(22, 50, 79, 0.12)",
          },
        }}
      />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />

            <Route
              path="dashboard"
              element={<Dashboard />}
            />

            <Route
              path="route-planner"
              element={<RoutePlanner />}
            />

            <Route
              path="scenario"
              element={<ScenarioSimulator />}
            />

            <Route
              path="alerts"
              element={<Alerts />}
            />

            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;