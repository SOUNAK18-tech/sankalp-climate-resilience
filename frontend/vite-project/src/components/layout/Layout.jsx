import { Outlet } from "react-router-dom";
import { useState } from "react";

import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onNavigate={() =>
          setSidebarOpen(false)
        }
      />

      <div className="app-main">
        <Navbar
          onMenuClick={() =>
            setSidebarOpen(
              (value) => !value
            )
          }
        />

        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <button
          className="mobile-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
          aria-label="Close navigation"
        />
      )}
    </div>
  );
}