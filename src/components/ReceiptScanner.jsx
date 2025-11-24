import { useState } from "react";
import preprocessImage from "./preprocessImage"; 

// Normalize 
function normalizeOCRText(text) {
  return text
    .replace(/O/g, "0")
    .replace(/l/g, "1")
    .replace(/I/g, "1")
    .replace(/S/g, "5")
    .replace(/,/g, ".")
    .replace(/[^0-9A-Za-z./\n\-: ]/g, " "); 
}

// Extract total: largest number in the receipt
function extractTotalFromText(text = "") {
  const cleanText = normalizeOCRText(text);
  const matches = cleanText.match(/\d+\.\d{2}/g); 
  if (!matches) return "";
  const numbers = matches.map(Number);
  return Math.max(...numbers).toFixed(2);
}

// Extract date: format MM/DD/YYYY
function extractDateFromText(text = "") {
  // Normalize
  let normalized = text
    .replace(/[:!|]/g, "/")
    .replace(/\,/g, "/")   
    .replace(/\:/g, "/")            
    .replace(/\\/g, "/")         
    .replace(/\s+/g, "")         
    .replace(/(\d)[^\d](\d)/g, "$1/$2"); 

  const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}\/\d{1,2}\/\d{1,2})/;

  const match = normalized.match(dateRegex);
  return match ? match[0] : "";
}

// Extract store: first line with at least 3 characters
function extractStoreFromText(text = "") {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const storeLine = lines.find(line => line.length >= 3);
  return storeLine || "";
}

export default function ReceiptScanner({ onScanComplete }) {
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setStatus("Preprocessing image...");
    setIsScanning(true);

    try {
      const preprocessedFile = await preprocessImage(file);

      setStatus("Scanning receipt...");
      const result = await Tesseract.recognize(preprocessedFile, "eng", {
        tessedit_pageseg_mode: 6,
        preserve_interword_spaces: 1,
        logger: (m) => {
          if (m.status === "recognizing text") {
            setStatus(`Scanning... ${Math.floor(m.progress * 100)}%`);
          }
        },
      });

      const rawText = result.data?.text || "";
      const total = extractTotalFromText(rawText);
      const date = extractDateFromText(rawText);
      const store = extractStoreFromText(rawText);

      setIsScanning(false);
      setStatus("Scan complete");

      onScanComplete({ rawText, total, date, store });
    } catch (err) {
      console.error(err);
      setStatus("Error scanning receipt");
      setIsScanning(false);
    }
  };

  return (
    <div className="receipt-scanner">
      <label className="primary-button choose-receipt" style={{ cursor: "pointer" }}>
        Choose Receipt
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
      </label>

      {image && (
        <div style={{ marginTop: 20 }}>
          <p>Preview:</p>
          <img
            src={image}
            alt="receipt preview"
            style={{ maxWidth: "250px", border: "1px solid #ccc" }}
          />
        </div>
      )}

      {status && <p style={{ marginTop: 10 }}>{status}</p>}
      {isScanning && <p>Scanning in progress...</p>}
    </div>
  );
}
