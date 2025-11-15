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
      
      {/* Dark overlay - click anywhere to close */}
      {open && (
        <div
          className="overlay"
          onClick={() => setOpen(false)}
        />
      )}

      <button
        className="primary-button"
        onClick={() => setOpen((prev) => !prev)}
      >
        {buttonLabel}
      </button>

      {open && (
        <div
          className="add-options-panel"
          style={{
            marginTop: "0px",
            display: "flex",
            gap: "10px",
            position: "absolute",
            left: "-60px", // exact position kept
            top: "50%",    // exact position kept
            transform: "translateY(-50%)"
          }}
        >
          <button
            className="option-button top animate-pop open"
            onClick={() => { onAddManual(); setOpen(false); }}
          >
            <img src="/src/assets/manual-logo.png" style={{width: "27px", marginLeft: "7px", marginTop: "2px"}}/>
          </button>
          <button
            className="option-button bottom animate-pop open"
            onClick={() => { onAddScan(); setOpen(false); }}
          >
            <img src="/src/assets/scan-logo.png" style={{width: "30px", marginLeft: "1px", marginTop: "2px"}}/>
          </button>
        </div>
      )}
    </div>
  );
}

export default AddButton;