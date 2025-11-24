import "./App.css";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, updateProfile, updateEmail } from "firebase/auth";
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
import PasswordRecovery from "./components/PasswordRecovery";
import CurrencyInput from "./components/CurrencyInput";


function App() {
  const [receipts, setReceipts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [viewingMenu, setViewingMenu] = useState(null);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [showAccountPanel, setShowAccountPanel] = useState(false);
  const [activeSetting, setActiveSetting] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedReceipts, setSelectedReceipts] = useState([]);
  const [filterPrice, setFilterPrice] = useState("All");
  const [customPrice, setCustomPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameStatus, setNameStatus] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [editingEmail, setEditingEmail] = useState(false);

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
    setNameInput(user?.displayName || "");
    setNameStatus("");
    setEditingName(false);
    setEmailInput(user?.email || "");
    setEmailStatus("");
    setEditingEmail(false);
  }, [user]);

  useEffect(() => {
    if (nameStatus !== "Name updated") return;
    const timer = setTimeout(() => setNameStatus(""), 2500);
    return () => clearTimeout(timer);
  }, [nameStatus]);

  useEffect(() => {
    if (emailStatus !== "Email updated") return;
    const timer = setTimeout(() => setEmailStatus(""), 2500);
    return () => clearTimeout(timer);
  }, [emailStatus]);

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

  const filteredReceipts = receipts.filter((r) =>{
    const categoryPass = 
    filterCategory === "All" ? true : r.category === filterCategory;

    let pricePass = true;
    if(filterPrice === "20") pricePass = r.amount >= 20;
    else if(filterPrice === "50") pricePass = r.amount >= 50;
    else if(filterPrice === "100") pricePass = r.amount >= 100;
    else if(filterPrice === "Other" && customPrice)
      pricePass = r.amount >= Number(customPrice.replace(/[^0-9.-]+/g, ""));
    
    return categoryPass && pricePass;

  });

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

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!auth.currentUser) {
      setNameStatus("Please sign in again to update your name.");
      return;
    }

    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      setNameStatus("Please enter a name.");
      return;
    }

    try {
      setNameStatus("Saving...");
      await updateProfile(auth.currentUser, { displayName: trimmedName });
      setUser(auth.currentUser);
      setNameStatus("Name updated");
      setEditingName(false);
    } catch (err) {
      console.error("Failed to update name:", err);
      setNameStatus("Failed to update name. Try again.");
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!user || !auth.currentUser) {
      setEmailStatus("Please sign in again to update your email.");
      return;
    }

    const trimmedEmail = emailInput.trim();
    if (!trimmedEmail) {
      setEmailStatus("Please enter an email.");
      return;
    }

    try {
      setEmailStatus("Saving...");
      await updateEmail(auth.currentUser, trimmedEmail);
      setUser(auth.currentUser);
      setEmailStatus("Email updated");
      setEditingEmail(false);
    } catch (err) {
      console.error("Failed to update email:", err);
      let friendly = "Failed to update email. Try again.";
      if (err.code === "auth/invalid-email") friendly = "Please enter a valid email address.";
      else if (err.code === "auth/email-already-in-use") friendly = "This email is already in use.";
      else if (err.code === "auth/requires-recent-login") friendly = "Please sign in again to update your email.";
      setEmailStatus(friendly);
    }
  };



  const handleDeleteAccount = async () =>{
    if(!user) return;

    try{
      const snapshot = await getDocs(collection(database, "users", user.uid, "receipts"));
      for(const docSnap of snapshot.docs){
        await deleteDoc(doc(database, "users", user.uid, "receipts", docSnap.id));
      }

      await user.delete();
      setUser(null);
      setReceipts([]);
      alert("Your account has been deleted.");
    }

    catch (err){
      console.error("Error deleting account: ", err);
      alert("Failed to delete account. Login and try again.");
    }
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

  if(activePage === "passwordRecovery"){
    return <PasswordRecovery onBack={()=> setActivePage(null)} />;
  }

  if(activePage === "accountInfo"){
    return(
      <>
      <Navbar 
          onLogout={handleLogout}
          userEmail={user?.email}
        />
        <div className="account-info-page">
          <h1>Account Info</h1>
          <div className="info-row">
            <span className="label">Name:</span>
            {editingName ? (
              <form className="name-inline-form" onSubmit={handleUpdateName}>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setEditingName(false);
                      setNameStatus("");
                      setNameInput(user?.displayName || "");
                    }
                  }}
                  placeholder="Enter your name"
                  autoFocus
                />
              </form>
            ) : (
              <div className="name-display">
                <span className="value">{user.displayName || "No name set"}</span>
                <button
                  type="button"
                  className="edit-name-button"
                  onClick={() => {
                    setEditingName(true);
                    setNameStatus("");
                  }}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          {nameStatus && <p className="name-status-inline">{nameStatus}</p>}
          <div className="info-row">
            <span className="label">Email:</span>
            {editingEmail ? (
              <form className="name-inline-form" onSubmit={handleUpdateEmail}>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setEditingEmail(false);
                      setEmailStatus("");
                      setEmailInput(user?.email || "");
                    }
                  }}
                  placeholder="Enter your email"
                  autoFocus
                />
              </form>
            ) : (
              <div className="name-display">
                <span className="value">{user.email}</span>
                <button
                  type="button"
                  className="edit-name-button"
                  onClick={() => {
                    setEditingEmail(true);
                    setEmailStatus("");
                  }}
                >
                  Edit
                </button>
              </div>
            )}
          </div>
          {emailStatus && <p className="name-status-inline">{emailStatus}</p>}
          <button className="back-button" onClick={() => setActivePage(null)}>
            Back
          </button>
        </div>
      </>
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

{showDeleteConfirm && (
          <div className="delete-confirm-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm Account Deletion</h3>
              <p>This will permanently delete your account and all receipts. Are you sure?</p>
              <div className="delete-confirm-buttons">
                <button className="delete-cancel-button" onClick={()=> setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button className="confirm-button" onClick={handleDeleteAccount}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

    <div className="app-root">
      
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

        
        {/*receipts cards*/}
        <section className="receipts-section">
          <div className="receipt-tools">
            
      <div className="filter-row" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "40px" }}>
        <div className="filter-wrapper" style={{ position: "relative" }}>
          <button
             className="filter-toggle-button"
             onClick={() => setShowFilters(prev => !prev)}
          >
            <img src="/src/assets/filter-icon.png" style={{ width: "20px" }} />
          </button>

    {showFilters && (
      <div className="filter-panel" style={{ display: "flex", gap: "5px", padding: "10px" }}>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-dropdown"
        >

          <option value="All">All Categories</option>
          {Array.from(new Set(receipts.map((r) => r.category))).map((cat) => (
            
            <option value={cat} key={cat}>{cat}</option>
          ))}
        </select>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        <select
          value={filterPrice}
          onChange={(e) => {
            setFilterPrice(e.target.value);
            if (e.target.value !== "Other") setCustomPrice("");
          }}
          className="filter-dropdown"
        >

          <option value="All">All Prices</option>
          <option value="20">Above $20</option>
          <option value="50">Above $50</option>
          <option value="100">Above $100</option>
          <option value="Other">Other Amount</option>
        </select>

        {filterPrice === "Other" && (
          <CurrencyInput
            value={customPrice}
            onChange={setCustomPrice}
            className="filter-input"
            placeholder="$00.00"
          />
        )}
      </div>
      </div>
    )}
  </div>

  {/*receipts selection*/}
  <button
    className="select-toggle-button toggle-button"
    onClick={() => {
      setSelectMode((prev) => !prev);
      setSelectedReceipts([]);
    }}
  >
    {selectMode ? "Cancel" : <img src="/src/assets/select-icon.png" style={{ width: "20px" }} />}
  </button>

  {/*delete selected*/}
  {selectMode && (
    <button
      className="bulk-delete-button"
      disabled={selectedReceipts.length === 0}
      onClick={() => {
        selectedReceipts.forEach((id) => handleDelete(id));
        setSelectedReceipts([]);
        setSelectMode(false);
      }}
    >
      Delete ({selectedReceipts.length})
    </button>
  )}
</div>
  
            
            
          </div>
          <div className="receipt-grid"
          style={{ marginTop: showFilters ? (filterPrice === "Other" ? "120px" : "80px") : "20px" }}>
            {receipts.length === 0 && (
              <p className="empty-text">
                You have no receipts yet. Tap “Add Receipt” to get started.
              </p>
            )}

            {filteredReceipts.map((receipt) => (
              <div className={`receipt-card ${selectMode && selectedReceipts.includes(receipt.id) ? "selected" : ""}`} 
              key={receipt.id} 
              onClick={() => {
                if(selectMode){
                  if(selectedReceipts.includes(receipt.id)){
                    setSelectedReceipts((prev) =>
                    prev.filter((id) => id !== receipt.id));
                  } 
                  else{
                    setSelectedReceipts((prev) => [...prev, receipt.id]);
                  }
                  return;
                }
              setViewingReceipt(receipt);
              }}
              
              style={{cursor: "pointer", position: "relative"}}
              >
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

        {showAccountPanel && !activePage &&(
          <div className="account-panel-overlay" onClick={()=> setShowAccountPanel(false)}>
            <div className="account-panel" onClick={(e)=> e.stopPropagation()}>
              <h2>Account Settings</h2>
              
              
              <div className="panel-item"
              onClick={()=> {
                setActivePage("accountInfo");
                setShowAccountPanel(false);}}>
                Account Info
                </div>

              <div className="panel-item"
                onClick={()=>{
                  setActivePage("passwordRecovery");
                  setShowAccountPanel(false);
                }}>
                  Password Recovery</div>
              
              <div className="panel-item danger-item"
              onClick={() => setShowDeleteConfirm(true)}>Delete Account</div>

              <button className="panel-close" onClick={() => setShowAccountPanel(false)}>
                <img className="arrow-img" src="/src/assets/arrow-icon.png" alt="" style={{width: "25px"}}/>
              </button>
            </div>
          </div> 
        )}

        
      </div>
      
      
    </div>
  </>
  );
}

export default App;
