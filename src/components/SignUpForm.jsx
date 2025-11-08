import { useState } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebaseConfig";


export default function SignupForm( { onSwitch }){
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");


const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Signup Successful!");
        setEmail("");
        setPassword("");
    }
    catch(err){
        setError(err.message);
    }
};

const handleGoogleSignup = async () =>{
    const provider = new GoogleAuthProvider();
    try{
        await signInWithPopup(auth, provider);
        alert("Signed up with Google Successfully!");
    }
    catch(err){
        setError(err.message);
    }
};

return(
    <div className="auth-container">
        <form className="auth-card" onSubmit={handleEmailSignup}>
            <h2>Sign Up</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Sign Up</button>
        </form>

        <p className="or-text">OR</p>
        <button className="google-button" onClick={handleGoogleSignup}>Continue with Google</button>
        {error && <p className="error-text" style={{ color: "red"}}>{error}</p>}
        <p>
            Already have an account? {" "}
            <button className="login-option-button" onClick={onSwitch}>Log In</button>
        </p>
    </div>
);
}