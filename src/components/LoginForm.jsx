import { useState } from "react";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function LoginForm({onSwitch }){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try{
            await signInWithEmailAndPassword(auth, email, password);
            setEmail("");
            setPassword("");
        }
        catch (err){
            setError("Invalid email or password. Try again.");
            console.error(err);
        }
    };

    const handleGoogleLogin = async ()=>{
        const provider = new GoogleAuthProvider();
        try{
            await signInWithPopup(auth, provider);
            alert("Logged in with Google Successfully!");
        }
        catch(err){
            setError(err.message);
        }
    };
    
    
    
    return (
    <div className="auth-container">
        <div className="auth-card">
            <h2 className="auth-title">Log In</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="submit">Login</button>
            </form>
            
        <div className="or-container">
            <p className="or-text">OR</p>
            <button className="google-button" onClick={handleGoogleLogin}>Continue with Google</button>

            {error && <p className="error-text">{error}</p>}

            <p>
                Don’t have an account?{" "}
                <button className="login-option-button" onClick={onSwitch}>Sign Up</button>
            </p>
        </div>
    </div>
  </div>
);
}