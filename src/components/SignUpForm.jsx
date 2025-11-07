import { useState } from "react";

export default function SignupForm( {onSignup, onSwitch }){
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");


const handleSubmit = (e) => {
    e.preventDefault();
    if(!email || !password)
        return;
    onSignup( {email, password });
    setEmail("");
    setPassword("");
};

return(
    <div>
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Sign Up</button>
        </form>
        <p>
            Already have an account? {" "}
            <button onClick={onSwitch}>Log In</button>
        </p>
    </div>
);
}