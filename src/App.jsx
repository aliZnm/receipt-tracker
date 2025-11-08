import './App.css';
import {useEffect, useState} from "react";
import {onAuthStateChanged, signOut} from 'firebase/auth';
import {auth} from "./firebaseConfig";
import LoginForm from "./components/LoginForm";
import SignupForm from './components/SignUpForm';
import AddReceiptForm from "./components/AddReceiptForm"
import { database } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';


function App(){
  const [receipts, setReceipts] = useState([]);

  //CHANGE TO TRUE TO ENABLE SIGNUP/LOGIN FORMS
  const developerMode = false;

  const [user, setUser] = useState(developerMode ? {email: "dev@aaaa.com"} : null);
  const [showLogin, setShowLogin] = useState(false);
  
  
  useEffect(() =>{
    if(!developerMode){
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }
  }, []);



  useEffect(() =>{
  if(!user) return;

  const fetchReceipts = async () =>{
    const snapshot = await getDocs(collection(database, "users", user.uid, "receipts"));
    const data = snapshot.docs.map((doc) => doc.data());
    setReceipts(data);
  };
  fetchReceipts();
}, [user]);


  const toggleForm = () => setShowLogin(!showLogin);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if(!user){
    return(
      <div className='app-container'>
        {showLogin ? (
          <LoginForm onSwitch={toggleForm} />
        ) : (
          <SignupForm onSwitch={toggleForm} />
          )}
      </div>
    );
  }


  //After user is logged in... show the receipt tracker
  return(
    <div className="app-container">
      <h1>Welcome, {user.email.split("@")[0]}!</h1>
      <button onClick={handleLogout}>Logout</button>
      <h2>Receipt Tracker</h2>
      <AddReceiptForm onAddReceipt={(receipt) => setReceipts([...receipts, receipt])} />
      
      <h3>Your Receipts</h3>
      <ul>
        {receipts.map((receipt, index) => (
          <li key={index}>
            {receipt.store} - ${receipt.amount} on {receipt.date}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App