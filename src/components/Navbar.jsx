// src/components/Navbar.jsx

export default function Navbar({ onLogout, onOpenSettings, userEmail }) {
  return (
    <header className="top-navbar">

      {/* LEFT — Logout button */}
      <button
        type="button"
        className="nav-icon-button"
        onClick={onLogout}
      >
        ⟵ Logout
      </button>

      {/* CENTER — Brand */}
      <div className="nav-brand">
        <span className="brand-dot" />
        <span className="brand-name">ReceiptTracker</span>
      </div>

      {/* RIGHT — Account Icon */}
      <button
        type="button"
        className="nav-icon-button account-button"
        onClick={onOpenSettings}
        aria-label="Open Settings"
      >
        <span className="account-circle">👤</span>
      </button>

    </header>
  );
}
