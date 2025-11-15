export default function ScanReceiptForm({ onAddReceipt }) {
  return (
    <div className="scan-form">
      <p>Scan receipt functionality will be implemented here using Tesseract.js or similar.</p>
      <button onClick={onAddReceipt}>Cancel</button>
    </div>
  );
}