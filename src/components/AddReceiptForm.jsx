import { useState } from "react";

export default function AddReceiptForm( { onAddReceipt }){
    const [store, setStore] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!store || !amount || !date) return;


        onAddReceipt( {store, amount, date} );

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