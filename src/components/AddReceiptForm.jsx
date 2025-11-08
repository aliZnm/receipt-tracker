import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { auth, database } from "../firebaseConfig";

export default function AddReceiptForm( { onAddReceipt }){
    const [store, setStore] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!store || !amount || !date) return;

        const user = auth.currentUser;
        if(!user) return alert("You must be logged in to add receipts.");

        const newReceipt = {store, amount, date, uid: user.uid};
        await addDoc(collection(database, "users", user.uid, "receipts"), newReceipt);


        onAddReceipt(newReceipt);

        //Clearing the store, amount, and date inputs in form:
        setStore("");
        setAmount("");
        setDate("");
    };

    return(
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Store Name" value={store} onChange={(e) => setStore(e.target.value)} />
            <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <button type="submit">Add Receipt</button>
        </form>
    );
}