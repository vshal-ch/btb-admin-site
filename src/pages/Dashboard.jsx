import { logout } from "../api/auth";
import { useState } from "react";
import "./Dashboard.css";
import DashboardSlots from "../components/DashboardSlots";
import VenueDetails from "../components/VenueDetails";
import ContactDetails from "../components/ContactDetails";
import MediaDetails from "../components/MediaDetails";

export default function Dashboard() {
  const [active, setActive] = useState("Dashboard");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const menuItems = [
    "Dashboard",
    "Venue Details",
    "Photos & media",
    "Contact Details",
  ];
  const handleLogout = async () => {
    try {
      await logout(); // returns {} if success
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  return (
    <div className="layout">
      {/* Top bar */}
      <header className="topbar">
        <div className="left-section">
          {/* Hamburger only on mobile */}
          <button
            className="hamburger"
            onClick={() => setIsMobileNavOpen((prev) => !prev)}
          >
            ☰
          </button>
          <div className="flex gap-2 items-center">
            <img src="logo.webp" alt="logo" width={32} height={32} />
            <h1 className="title text-2xl font-bold">Beat The Box Admin</h1>
          </div>
        </div>
        {/* Logout only visible in desktop */}
        <button className="logout-btn desktop-only" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="content">
        {/* Sidebar / Mobile nav */}
        <nav className={`sidebar ${isMobileNavOpen ? "open" : ""}`}>
          {menuItems.map((item) => (
            <button
              key={item}
              className={`nav-item ${active === item ? "active" : ""}`}
              onClick={() => {
                setActive(item);
                setIsMobileNavOpen(false);
              }}
            >
              {item}
            </button>
          ))}
          {/* Logout button inside nav on mobile */}
          <button
            className="nav-item mobile-only logout-link"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>

        {/* Backdrop for mobile nav */}
        {isMobileNavOpen && (
          <div
            className="backdrop"
            onClick={() => setIsMobileNavOpen(false)}
          ></div>
        )}

        {/* Main section */}
        <main className="main">
          {active === "Dashboard" && (
            <div>
              <DashboardSlots />
            </div>
          )}
          {active === "Venue Details" && (
            <div>
              <VenueDetails />
            </div>
          )}
          {active === "Photos & media" && (
            <div>
              <MediaDetails />
            </div>
          )}
          {active === "Contact Details" && (
            <div>
              <ContactDetails />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
