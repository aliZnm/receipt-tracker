import "./App.css";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, database } from "./firebaseConfig";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignUpForm";
import AddReceiptForm from "./components/AddReceiptForm";
import { collection, getDocs } from "firebase/firestore";
import ScanReceiptForm from "./components/ScanReceiptForm";
import AddButton from "./components/AddButton";


function App() {
  const [receipts, setReceipts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // set to true if you want to bypass auth during testing
  const developerMode = false;

  const [user, setUser] = useState(
    developerMode ? { email: "dev@aaaa.com", uid: "dev" } : null
  );
  const [showLogin, setShowLogin] = useState(false);
  const [activeAddForm, setActiveAddForm] = useState(null);
  useEffect(() => {
    if (!developerMode) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchReceipts = async () => {
      const snapshot = await getDocs(
        collection(database, "users", user.uid, "receipts")
      );

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReceipts(data);
    };

    fetchReceipts();
  }, [user]);

  const toggleFormType = () => setShowLogin((prev) => !prev);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleAddReceipt = (receipt) => {
    setReceipts((prev) => [receipt, ...prev]); // newest first
    setShowAddForm(false);
  };

  // Not logged in: auth screen
  if (!user) {
    return (
      <div className="auth-page">
        {showLogin ? (
          <LoginForm onSwitch={toggleFormType} />
        ) : (
          <SignupForm onSwitch={toggleFormType} />
        )}
      </div>
    );
  }

  // Logged in: dashboard
  return (
    <div className="app-root">
      <div className="dashboard">
        {/* top bar */}
        <header className="dashboard-header">
          <div className="brand">
            <span className="brand-dot" />
            <span className="brand-name">ReceiptTracker</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </header>

        {/* title row */}
        <section className="dashboard-main">
          <div className="dashboard-text">
            <h1>Your Receipts</h1>
            <p>
              Track, organize, and search your purchase history in one place.
            </p>
          </div>
          
          <div className="dashboard-actions">
            <AddButton
            buttonLabel="+ Add Receipt"
            onAddManual={() => setActiveAddForm("manual")}
            onAddScan={() => setActiveAddForm("scan")}/>
          </div>

          {activeAddForm === "options" && (
            <>
              <div className="overlay" onClick={() => setActiveAddForm(null)}></div>
              <div className="add-options-panel">
                <button className="option-button top" onClick={() => setActiveAddForm("manual")}>M</button>
                <button className="option-button bottom" onClick={() => setActiveAddForm("scan")}>S</button>
              </div>
            </>
          )}


        </section>

        {/* add form */}
        {activeAddForm === "manual" && (
          <div className="add-form-panel">
            <AddReceiptForm 
            onAddReceipt={(receipt) => {
              handleAddReceipt(receipt);
              setActiveAddForm(null);
            }} />
          </div>
        )}

        {activeAddForm === "scan" && (
          <div className="add-form-panel">
            <ScanReceiptForm
            onAddReceipt={() => setActiveAddForm(null)} />
          </div>
        )}

        {/* cards */}
        <section className="receipts-section">
          <div className="receipt-grid">
            {receipts.length === 0 && (
              <p className="empty-text">
                You have no receipts yet. Tap “Add Receipt” to get started.
              </p>
            )}

            {receipts.map((receipt) => (
              <div className="receipt-card" key={receipt.id}>
                <div className="receipt-card-header">
                  <h2>{receipt.store}</h2>
                </div>
                <p className="receipt-date">{receipt.date}</p>
                <p className="receipt-amount">
                  ${Number(receipt.amount).toFixed(2)}
                </p>
                <p className="receipt-subtext">
                  Tap to view photo, category, and more details.
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;