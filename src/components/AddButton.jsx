import { useState, useRef, useEffect } from "react";
import AddReceiptForm from "./AddReceiptForm";
import ScanReceiptForm from "./ScanReceiptForm";

function AddButton({ buttonLabel = "+", onAddManual, onAddScan }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(()=>{
    function handleClickOutside(event){
        if(wrapperRef.current && !wrapperRef.current.contains(event.target)){
            setOpen(false);
        }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>{
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  return (
    <div className="add-button-wrapper" ref={wrapperRef} style={{ position: "relative" }}>
      <button
        className="primary-button" // keep same class as before
        onClick={() => setOpen((prev) => !prev)}
      >
        {buttonLabel}
      </button>

      {open && (
        <div className="add-options-panel"
        style={{
            marginTop: "0px",        
            display: "flex",
            gap: "10px",
            position: "absolute",     
            left: "-60px",            
            top: "50%",             
            transform: "translateY(-50%)" 
    }}>
          <button className="option-button" onClick={() => { onAddManual(); setOpen(false); }}>M</button>
          <button className="option-button" onClick={() => { onAddScan(); setOpen(false); }}>S</button>
        </div>
      )}
    </div>
  );
}

export default AddButton;