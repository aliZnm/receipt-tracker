import React, { useState } from "react";
import ReceiptScanner from "./ReceiptScanner";
import { addDoc, collection } from "firebase/firestore";
import { auth, database } from "../firebaseConfig";

export default function ScanReceiptForm({ onAddReceipt, onCancel }) {
  const [rawText, setRawText] = useState("");
  const [total, setTotal] = useState("");
  const [store, setStore] = useState("");
  const [date, setDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [editingField, setEditingField] = useState(null);

  const handleScanComplete = ({ rawText, total, date, store }) => {
    setRawText(rawText);
    setTotal(total);
    setStore(store);
    setDate(date);
  };

  const handleSave = async () => {
    setError("");
    if (!store || !total || !date) {
      setError("Store, total, and date are required to save.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to save receipts.");
      return;
    }

    try {
      setIsSubmitting(true);

      const newReceipt = {
        store,
        amount: parseFloat(total),
        date,
        rawText,
        uid: user.uid,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(
        collection(database, "users", user.uid, "receipts"),
        newReceipt
      );

      const receiptWithId = { id: docRef.id, ...newReceipt };
      onAddReceipt(receiptWithId);

      setRawText("");
      setTotal("");
      setStore("");
      setDate("");
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setError("Failed to save receipt.");
      setIsSubmitting(false);
    }
  };

  const renderField = (label, value, setter, type = "text") => {
    if (editingField === label) {
      return (
        <input
          type={type}
          value={value}
          onChange={(e) => setter(e.target.value)}
          onBlur={() => setEditingField(null)}
          autoFocus
          className="styled-input"
        />
      );
    } else {
      return (
        <span>
          {value || "[Not detected]"}{" "}
          <button
            type="button"
            onClick={() => setEditingField(label)}
            className="edit-button"
          >
            Edit
          </button>
        </span>
      );
    }
  };


  return (
    <div className="scan-form">
      <ReceiptScanner onScanComplete={handleScanComplete} />
      <button type="button" className="cancel-button" onClick={onCancel}> <span style={{marginBottom: "5px"}}>x</span></button>

      {rawText && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Scanned Receipt Data</h3>

          <p>
            <strong>Store:</strong>{" "}
            {renderField("Store", store, setStore)}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {renderField("Date", date, setDate, "text")}
          </p>

          <p>
            <strong>Total:</strong>{" "}
            {renderField("Total", total, setTotal, "number")}
          </p>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button
            className="submit-button"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Receipt"}
          </button>
        </div>
      )}
    </div>
  );
}
