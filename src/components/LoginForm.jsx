import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
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


    return(
        <div>
            <h2>Log In</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="submit">Login</button>
            </form>

            {error && <p style={{color: "red"}}>{error}</p>}
            <p>
                Don't have an account?{" "}
                <button onClick={onSwitch}>Sign Up</button>
            </p>
        </div>
        
    );
}