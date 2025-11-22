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
import Navbar from "./components/Navbar";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import './settingPanel.css';

function App() {
  const [receipts, setReceipts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [viewingMenu, setViewingMenu] = useState(null);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [showAccountPanel, setShowAccountPanel] = useState(false);
  const [activeSetting, setActiveSetting] = useState(null);
  const [activePage, setActivePage] = useState(null);
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


  useEffect(()=> {
    function handleClickOutside(e){
      if(viewingMenu !== null){
        setViewingMenu(null);
      }
    }
    document.addEventListener("click", handleClickOutside);
  }, [viewingMenu]);

  const toggleFormType = () => setShowLogin((prev) => !prev);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleAddReceipt = (receipt) => {
    setReceipts((prev) => [receipt, ...prev]); // newest first
    setShowAddForm(false);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(database, "users", user.uid, "receipts", id));
    setReceipts((prev) => prev.filter((r) => r.id !== id));
  };

  const handleEdit = async (updated)=>{
    const {id, ...cleanData} = updated;
    await updateDoc(
      doc(database, "users", user.uid, "receipts", id),cleanData
    );

    setReceipts((prev) => prev.map((r)=> (r.id === updated.id ? updated : r)));
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
    <>
    <Navbar 
            onLogout={handleLogout}
            onOpenSettings={() => setShowAccountPanel(true)}
            userEmail={user?.email}
          />

    <div className="app-root">
      {activePage === "accountInfo" ? (
        <div className="account-info-page">
          <h1>Account Info</h1>
          <div className="info-row">
            <span className="label">Name:</span>
            <span>{user.displayName || "No name set"}</span>
          </div>

          <div className="info-row">
            <span className="label">Email:</span>
            <span className="value">{user.email}</span>
          </div>

          <button className="back-button" onClick={() => setActivePage(null)}>
            Back
          </button>
        </div>
      ) : (
        <div className="dashboard">
      
        


       
        <section className="dashboard-main">
          <div className="dashboard-text">
            <h1>Your Receipts</h1>
            <p>
              Track, organize, and search your purchase history in one place.
            </p>
          </div>
          
          <div className="dashboard-actions">
            {!activeAddForm && (
              <AddButton
                buttonLabel="+ Add Receipt"
                onAddManual={() => setActiveAddForm("manual")}
                onAddScan={() => setActiveAddForm("scan")}/>
                )}
          </div>
        </section>

        {activeAddForm === "manual" && (
          <div className="add-form-panel">
            <AddReceiptForm 
            onAddReceipt={(receipt) => {
              handleAddReceipt(receipt);
              setActiveAddForm(null);
            }} 
            onCancel={() => setActiveAddForm(null)}/>
          </div>
        )}

        {activeAddForm === "scan" && (
          <div className="add-form-panel">
            <ScanReceiptForm
              onAddReceipt={handleAddReceipt}      
              onCancel={() => setActiveAddForm(null)} 
            />
          </div>
        )}

        {activeAddForm === "edit" && (
          <div className="add-form-panel">
            <AddReceiptForm
            editingReceipt={editingReceipt}
            onSaveEdit={(updated)=>{
              handleEdit(updated);
              setEditingReceipt(null);
              setActiveAddForm(null);
            }}
            onCancel={() =>{
              setEditingReceipt(null);
              setActiveAddForm(null);
            }}
            />
          </div>
        )}

        {activeAddForm === "settings" && (
          <div className="add-form-panel">
            <h2 style={{ marginTop: 0 }}>Account Settings</h2>
            <p>Email: {user?.email}</p>
        
            <button 
              className="submit-button" 
              onClick={() => setActiveAddForm(null)}
              style={{ marginTop: "1rem" }}
            >
              Close
            </button>
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
              <div className="receipt-card" key={receipt.id} onClick={() => setViewingReceipt(receipt)} style={{cursor: "pointer", position: "relative"}}>
                <div className="receipt-menu-btn"
                onClick={(e)=>{
                  e.stopPropagation();
                  setViewingMenu(receipt.id);
                }}>
                  ⋮
                </div>

                {viewingMenu === receipt.id &&(
                  <div className="receipt-menu" onClick={(e)=> e.stopPropagation()}>
                    <button className="receipt-menu-item" onClick={()=>{
                      setEditingReceipt(receipt);
                      setActiveAddForm("edit");
                      setViewingReceipt(null);
                      setViewingMenu(null);
                    }}>
                      Edit Receipt
                    </button>

                    <button className="receipt-menu-item delete" onClick={()=> {
                      handleDelete(receipt.id);
                      setViewingMenu(null);
                    }}>
                      Delete Receipt
                    </button>
                  </div>
                )}
                
                <div className="receipt-card-header">
                  <h2>{receipt.store}</h2>
                </div>
                <p className="receipt-date" style={{paddingTop: "5px"}}>{receipt.date}</p>
                <p className="receipt-amount">${Number(receipt.amount).toFixed(2)}</p>
                <p className="receipt-category" style={{fontSize: "15px"}}>{receipt.category}</p>
                <p className="receipt-subtext">
                  Tap to view receipt
                </p>
              </div>
            ))}
          </div>
        </section>

        {viewingReceipt && viewingReceipt.imageUrl && (
          <div className="receipt-modal">
            <div style={{
              position: "relative",
              background: "black",
              padding: "10px",
              borderRadius: "10px",
              display: "inline-block",
              
            }}>
              <button onClick={() => setViewingReceipt(null)}
                style={{
                  position: "absolute",
                  top: "-20px",
                  left: "-15px",
                  background: "linear-gradient(135deg, #2a8bff, #4fc3ff)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: "50px",
                  height: "50px",
                  cursor: "pointer",
                  fontSize: "25px",
                  boxShadow: "0px 0px 5px 3px black",
                  }}>
                    x
                  </button>
                  <img src={viewingReceipt.imageUrl} alt="Receipt" style={{ maxWidth: "80vw", maxHeight: "80vh", display: "block" }}/>
            </div>
          </div>
        )}

        {showAccountPanel && (
          <div className="account-panel-overlay" onClick={()=> setShowAccountPanel(false)}>
            <div className="account-panel" onClick={(e)=> e.stopPropagation()}>
              <h2>Account Settings</h2>
              
              
              <div className="panel-item"
              onClick={()=> {
                setActivePage("accountInfo");
                setShowAccountPanel(false);}}>
                Account Info
                </div>

              <div className="panel-item">Password Recovery</div>
              <div className="panel-item danger-item">Delete Account</div>

              <button className="panel-close" onClick={() => setShowAccountPanel(false)}>
                <img className="arrow-img" src="/src/assets/arrow-icon.png" alt="" style={{width: "25px"}}/>
              </button>
            </div>
          </div> 
        )}
      </div>
      
      )}
    </div>
  </>
  );
}

export default App;
