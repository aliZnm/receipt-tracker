// src/components/Navbar.jsx

export default function Navbar({ onOpenSettings, userEmail }) {
  return (
    <header className="top-navbar">
      <div className="nav-spacer" aria-hidden="true" />
      <div className="nav-brand">
        <img src="/src/assets/receipt-logo.svg" alt="Receipt Tracker logo" className="brand-logo" />
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
