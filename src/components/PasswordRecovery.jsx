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
            setMessage("Password reset email sent! Check your inbox.");
            setEmail("");
            } catch (err) {
                setError(err.message);
                console.error(err);
            }
        };



        return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Password Recovery</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}
          <button type="submit">Send Reset Email</button>
        </form>
        <button className="login-option-button" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}