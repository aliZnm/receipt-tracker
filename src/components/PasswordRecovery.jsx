import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function PasswordRecovery({onBack}){
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Email sent! check spam folder");
            setEmail("");
            } 
            catch (err) {
                setError(err.message);
                console.error(err);
            }
        };



        return (
    <div className="account-info-page" style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h1>Password Recovery</h1>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div className="info-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <label htmlFor="email" style={{marginBottom: "10px"}}>Email:</label>
          <input
          className="email-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "8px", width: "100%", fontSize: "16px" }}
          />
        </div>

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="back-button" style={{ marginTop: "10px" }}>
          Send Reset Email
        </button>
      </form>

      <button className="back-button2" onClick={onBack} style={{ marginTop: "20px" }}>
        Back
      </button>
    </div>
  );
}