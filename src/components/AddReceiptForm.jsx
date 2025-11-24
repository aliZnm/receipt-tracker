import { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { auth, database, storage } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CurrencyInput from "./CurrencyInput";


export default function AddReceiptForm({ 
    onAddReceipt,
    onSaveEdit, 
    onCancel, 
    editingReceipt 
}) {
  const [store, setStore] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState(editingReceipt?.category || "");


  useEffect(()=>{
    if(editingReceipt){
        setStore(editingReceipt.store);
        setAmount(editingReceipt.amount.toString());
        setDate(editingReceipt.date);
        setCategory(editingReceipt.category)
        setPreviewUrl(editingReceipt.imageUrl || null);
        setFile(null);
    }
  }, [editingReceipt])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!store || !amount || !date) {
      setError("Please fill out all the details.");
      return;
    }


    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to add receipts.");
      return;
    }

    try {
      setIsSubmitting(true);

      let imageUrl = editingReceipt?.imageUrl || "";
      
      if(file){
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "receipt_upload");
    
    const CLOUDINARY_URL = 
    "https://api.cloudinary.com/v1_1/dc77fisjp/image/upload";
    
    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,  
    });

    if(!response.ok) throw new Error("image upload failed");

    const data = await response.json();
    imageUrl = data.secure_url;
}

const  updateData = {
    store,
    amount: Number(amount.replace(/[^0-9.-]+/g, "")),
    date,
    category,
    uid: user.uid,
    imageUrl,
};

if(editingReceipt){
    onSaveEdit({...editingReceipt, ...updateData});
}
else{
    const newReceipt = {
        ...updateData,
        createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(
        collection(database, "users", user.uid, "receipts"),
        newReceipt
    );

    onAddReceipt({id: docRef.id, ...newReceipt});
}

setStore("");
setAmount("");
setDate("");
setCategory("");
setFile(null);
setPreviewUrl(null);
//setIsSubmitting(false);
    }
    catch(err){
        console.error(err);
        setError("Something went wrong.");
    }
    setIsSubmitting(false);
};
  

  return (
    <div className="recept-form-container">
        <button type="button" className="cancel-button" onClick={onCancel}>
            <span style={{marginBottom: "5px"}}>x</span>
        </button>
        
        <form onSubmit={handleSubmit} className="receipt-form">
            <div className="input-column">
                <input
                    type="text"
                    placeholder="Store Name"
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                    className="styled-input"/>
                <CurrencyInput 
                value={amount}
                onChange={setAmount}
                className="styled-input"
                />
                
                <select 
                value={category} 
                onChange={(e)=> setCategory(e.target.value)} 
                className="category-select">
                    <option value="" disabled hidden>
                        Select Category
                    </option>
                    <option value="Grocery">Grocery</option>
                    <option value="Resturants">Resturants</option>
                    <option value="Bills">Bills</option>
                    <option value="Gas">Gas</option>
                    <option value="Other">Other</option>
                </select>
                
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="styled-input"/>
            </div>
            
            <div className="upload-box small">
                <label className="upload-label">
                   {previewUrl && !file &&(
                    <div style={{textAlign: "center"}}>
                        <img src={previewUrl}
                        style={{
                            width: "120px",
                            marginBottom: "80px",
                            borderRadius: "8px",
                            border: "2px solid #ccc"
                        }}/>

                        <p>Current Image</p>
                        <p style={{fontSize: "13px"}}>Upload new image</p>
                    </div>
                   )}
                    {file ? (
                        <span className="upload-selected">📄 {file.name}</span>
                    ) : !previewUrl ? (
                    <>
                    <span className="upload-icon">
                        <img 
                        src="/src/assets/upload-logo.png" 
                        style={{width: "50px", marginTop: "15px"}}/>
                    </span>
                    
                    <p>Upload Receipt Image</p>
                    <span className="upload-hint">Click to select a file</span>
                    </>
                ) : null}
                
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        setFile(e.target.files[0] || null);

                        if(e.target.files[0]){
                            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                        }
                    }
                    }/>
                </label>
            </div>
            
            {error && <p className="error-text">{error}</p>}
            
            <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}>
            
            {isSubmitting 
            ? (editingReceipt 
                ? "Saving..." 
                : "Adding..." )
            : (editingReceipt 
            ? "Save" 
            : "Add")}
            </button>
        </form>
    </div>
  );
}


