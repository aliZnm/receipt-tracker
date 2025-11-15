import { useState } from "react";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, OAuthProvider } from "firebase/auth";
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
    
    const handleAppleLogin = async () =>{
    const provider = new OAuthProvider("apple.com");
    try{
        await signInWithPopup(auth, provider);
        alert("Signed up with APple Successfully!");
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
                
                {error && <p className="error-text">{error}</p>}
                <button type="submit">Login</button>
                
            </form>
            
        <div className="or-container">
            <p className="or-text">OR</p>

            <div className="auth-buttons">
                <button className="google-button" onClick={handleGoogleLogin}>
                    Login with Google
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="google-logo social-logos"/>
                </button>

                <button className="apple-button" onClick={handleAppleLogin}>
                    Login with Apple
                    <img src="/src/assets/apple-logo.png"  className="apple-logo social-logos" />
                </button>
            </div>
            
            <p>
                Don’t have an account?{" "}
                <button className="login-option-button" onClick={onSwitch}>Sign Up</button>
            </p>
        </div>
    </div>
  </div>
);
}