import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { auth, database, storage } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AddReceiptForm({ onAddReceipt, onCancel }) {
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
    //   const filePath = `receipts/${user.uid}/${Date.now()}-${file.name}`;
    //   const fileRef = ref(storage, filePath);
    //   await uploadBytes(fileRef, file);
    //   const imageUrl = await getDownloadURL(fileRef);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "receipt_upload");
    const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dc77fisjp/image/upload";
    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,  
    });

    if(!response.ok) throw new Error("image upload failed");

    const data = await response.json();
    const imageUrl = data.secure_url;

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
    <div className="recept-form-container">
        <button type="button" className="cancel-button" onClick={onCancel}> <span style={{marginBottom: "5px"}}>x</span></button>
        
        <form onSubmit={handleSubmit} className="receipt-form">
            <div className="input-column">
                <input
                    type="text"
                    placeholder="Store Name"
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                    className="styled-input"/>
                <input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="styled-input"/>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="styled-input"/>
            </div>
            
            <div className="upload-box small">
                <label className="upload-label">
                    {file ? (
                        <span className="upload-selected">📄 {file.name}</span>
                    ) : (
                    <>
                    <span className="upload-icon">
                        <img src="/src/assets/upload-logo.png" style={{width: "50px", marginTop: "15px"}}/>
                    </span>
                    <p>Upload Receipt Image</p>
                    <span className="upload-hint">Click to select a file</span>
                    </>
                )}
                
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0] || null)}/>
                </label>
            </div>
            
            {error && <p className="error-text">{error}</p>}
            
            <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add"}
            </button>
        </form>
    </div>
  );
}