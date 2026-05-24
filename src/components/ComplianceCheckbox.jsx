export const ComplianceCheckbox = ({ onToggle }) => (
  <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff9c4', marginTop: '20px' }}>
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
      <input type="checkbox" onChange={(e) => onToggle(e.target.checked)} style={{ marginTop: '4px' }} />
      <span style={{ fontSize: '14px', color: '#555' }}>
        <strong>Legal Declaration:</strong> I am a licensed retailer/wholesaler (18+). 
        I accept full legal responsibility for product resale and compliance with local regulations.
      </span>
    </label>
  </div>
);

