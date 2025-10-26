import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE } from '../api.js';

const accent = "#4f8cff";
const accentLight = "#e3f0ff";
const accentDark = "#1a237e";
const bg = "#f8faff";

const getSupplierOpeningBalance = (name: string) => {
  const balances: Record<string, number> = {
    'Supplier A': 1200,
    'Supplier B': 1800,
    'Supplier C': 1700,
  };
  return balances[name] || 0;
};

const inputNoSpinner = {
  MozAppearance: 'textfield',
  appearance: 'textfield',
};

const SupplierDetail: React.FC = () => {
  const { name = '' } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [openingBalance, setOpeningBalance] = useState('');
  const [purchase, setPurchase] = useState('');
  const [payment, setPayment] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const ob = parseFloat(openingBalance) || 0;
    const pur = parseFloat(purchase) || 0;
    const pay = parseFloat(payment) || 0;
    setClosingBalance((ob + pur - pay).toString());
  }, [openingBalance, purchase, payment]);

  useEffect(() => {
    if (openingBalance === '') {
      setOpeningBalance(getSupplierOpeningBalance(name).toString());
    }
  }, [name]);

  useEffect(() => {
    fetch(`${API_BASE}/supplier/${encodeURIComponent(name)}/latest`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setOpeningBalance(data['Closing Balance'] || '');
        }
      });
  }, [name]);

  const handleSave = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const row = {
      date: today,
      openingBalance,
      purchase,
      payment,
      closingBalance,
      remarks,
    };
    const res = await fetch(`${API_BASE}/supplier/${encodeURIComponent(name)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    });
    if (res.ok) {
      alert('Saved!');
      navigate('/');
    } else {
      alert('Error saving data');
    }
  };

  return (
    <div style={{
      maxWidth: 500,
      margin: '2rem auto',
      padding: '2rem',
      border: `1px solid ${accentLight}`,
      borderRadius: 16,
      background: '#fff',
      color: accentDark,
      boxShadow: '0 4px 24px #4f8cff22',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <style>{`
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
      <h2 style={{ color: accentDark, fontWeight: 800, fontSize: 28, marginBottom: 24 }}>Supplier: {name}</h2>
      <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Opening Balance</label>
          <input
            type="number"
            value={openingBalance}
            onChange={e => setOpeningBalance(e.target.value)}
            onFocus={e => e.target.select()}
            style={Object.assign({ width: '100%', padding: 12, color: accentDark, background: bg, border: `1px solid ${accentLight}`, borderRadius: 8, fontSize: 16 }, inputNoSpinner) as any}
            placeholder="Enter opening balance"
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Today's Purchases</label>
          <input
            type="number"
            value={purchase}
            min={0}
            onChange={e => setPurchase(e.target.value)}
            onFocus={e => e.target.select()}
            style={Object.assign({ width: '100%', padding: 12, color: accentDark, background: bg, border: `1px solid ${accentLight}`, borderRadius: 8, fontSize: 16 }, inputNoSpinner) as any}
            placeholder="Enter purchases"
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Today's Payments</label>
          <input
            type="number"
            value={payment}
            min={0}
            onChange={e => setPayment(e.target.value)}
            onFocus={e => e.target.select()}
            style={Object.assign({ width: '100%', padding: 12, color: accentDark, background: bg, border: `1px solid ${accentLight}`, borderRadius: 8, fontSize: 16 }, inputNoSpinner) as any}
            placeholder="Enter payments"
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, color: accentDark }}>Closing Balance</label>
          <input
            type="number"
            value={closingBalance}
            onChange={e => setClosingBalance(e.target.value)}
            onFocus={e => e.target.select()}
            style={Object.assign({ width: '100%', padding: 12, fontWeight: 'bold', background: accentLight, color: accentDark, border: `1px solid ${accentLight}`, borderRadius: 8, fontSize: 16 }, inputNoSpinner) as any}
            placeholder="Closing balance"
          />
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Remarks</label>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: 12, resize: 'vertical', color: accentDark, background: bg, border: `1px solid ${accentLight}`, borderRadius: 8, fontSize: 16 }}
            placeholder="Enter any remarks here..."
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: 16, background: accent, color: '#fff', border: 'none', borderRadius: 8, fontSize: 18, cursor: 'pointer', fontWeight: 700, boxShadow: '0 2px 8px #4f8cff22', letterSpacing: 1 }}>Save</button>
      </form>
    </div>
  );
};

export default SupplierDetail; 