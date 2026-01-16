import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, BarChart3, CalendarDays } from 'lucide-react';

const Layout = () => {
  return (
    <div className="layout">
      <main className="main-content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <div className="nav-container container">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={24} />
            <span>Today</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <CalendarDays size={24} />
            <span>History</span>
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <BarChart3 size={24} />
            <span>Stats</span>
          </NavLink>
        </div>
      </nav>

      <style>{`
        .layout {
          min-height: 100vh;
          padding-bottom: 80px; /* Space for nav */
          background-color: var(--bg-primary);
        }
        
        .main-content {
          min-height: calc(100vh - 80px);
        }

        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 70px;
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border-top: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          z-index: 100;
          box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .nav-container {
          display: flex;
          justify-content: space-around;
          width: 100%;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.3s ease;
          gap: 4px;
        }

        .nav-item.active {
          color: var(--accent-primary);
          transform: translateY(-2px);
        }

        .nav-item:hover:not(.active) {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default Layout;
