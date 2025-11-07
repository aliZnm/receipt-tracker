import './App.css';
import { useState } from "react";
import LoginForm from "./components/LoginForm";
import SignupForm from './components/SignUpForm';
import AddReceiptForm from "./components/AddReceiptForm"

function App(){
  //The state for recepits:
  const [receipts, setReceipts] = useState([]);

  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  
  //Handeling:
  const handleLogin = ({ email, password }) => {
    setUser(email);
  };

  const handleSignup = (username) => {
    setUser(username);
  };


  const toggleForm = () => setShowLogin(!showLogin);

  if(!user){
    return(
      <div className='app-container'>
        {showLogin ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <SignupForm onSignup={handleSignup} onSwitch={toggleForm} />
          )}

      </div>
    );
  }


  //After user is logged in... show the receipt tracker
  return(
    <div className="app-container">
      <h1>Receipt Tracker</h1>
      <AddReceiptForm onAddReceipt={(receipt) => setReceipts([...receipts, receipt])} />
      
      <h2>Receipts</h2>
      <ul>
        {receipts.map((receipt, index) => (
          <li key={index}>
            {receipt.name} - ${receipt.amount} on {receipt.date}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App