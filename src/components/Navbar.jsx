// src/components/Navbar.jsx

export default function Navbar({ onLogout, onOpenSettings, userEmail }) {
  return (
    <header className="top-navbar">

      {/* LEFT — Logout button */}
      <button
        type="button"
        className="logout-button"
        onClick={onLogout}
      >
         Logout
      </button>

      {/* CENTER — Brand */}
      <div className="nav-brand">
        <span className="brand-dot" />
        <span className="brand-name">ReceiptTracker</span>
      </div>

      
      <div className="account-icon"
      onClick={onOpenSettings} 
      role="button"
      tabIndex={0}
      aria-label="Open Setting">
        <img src="/src/assets/account-logo2.png" alt="Account" className="account-img" />
      </div>

    </header>
  );
}
