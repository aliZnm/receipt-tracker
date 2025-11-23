import { useState } from "react";

export default function CurrencyInput({value, onChange, className}){
    const formatCurrency = (num) =>{
        const cents = Math.max(0, parseInt(num.replace(/\D/g, "")) || 0);
        return (cents/100).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
        })
    };


    const handleInput = (e) =>{
        const raw = e.target.value;
        const digitsOnly = raw.replace(/\D/g, "");
        const newValue = formatCurrency(String(digitsOnly));
        onChange(newValue);
    };


    return(
        <input type="text"
        className={className}
        value={value}
        onChange={handleInput}
        placeholder="$00.00" />
    );
}