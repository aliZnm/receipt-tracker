import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { auth, database, storage } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AddReceiptForm({ onAddReceipt }) {
  const [store, setStore] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!store || !amount || !date) {
      setError("Please fill out all the details.");
      return;
    }

    if (!file) {
      setError("Please upload a picture of your receipt.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to add receipts.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1) Upload image to Firebase Storage
      const filePath = `receipts/${user.uid}/${Date.now()}-${file.name}`;
      const fileRef = ref(storage, filePath);
      await uploadBytes(fileRef, file);
      const imageUrl = await getDownloadURL(fileRef);

      // 2) Save Firestore document
      const newReceipt = {
        store,
        amount: parseFloat(amount),
        date,
        uid: user.uid,
        imageUrl,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(
        collection(database, "users", user.uid, "receipts"),
        newReceipt
      );

      const receiptWithId = { id: docRef.id, ...newReceipt };

      // 3) Update parent state
      onAddReceipt(receiptWithId);

      // 4) Reset form
      setStore("");
      setAmount("");
      setDate("");
      setFile(null);
      setIsSubmitting(false);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while saving your receipt.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="receipt-form">
      {/* Upload area */}
      <div className="upload-box">
        <label className="upload-label">
          {file ? (
            <span className="upload-selected">📄 {file.name}</span>
          ) : (
            <>
              <span className="upload-icon">⬆️</span>
              <p>Upload Receipt Image</p>
              <span className="upload-hint">Click to select a file</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
        </label>
      </div>

      {/* Details row */}
      <div className="input-row">
        <input
          type="text"
          placeholder="Store Name"
          value={store}
          onChange={(e) => setStore(e.target.value)}
          className="styled-input"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="styled-input"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="styled-input"
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <button
        type="submit"
        className="submit-button"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Add Receipt"}
      </button>
    </form>
  );
}